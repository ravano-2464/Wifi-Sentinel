using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

namespace WifiSentinel {
    class Program {
        [DllImport("wlanapi.dll")]
        public static extern int WlanOpenHandle(uint dwClientVersion, IntPtr pReserved, out uint pdwNegotiatedVersion, out IntPtr phClientHandle);

        [DllImport("wlanapi.dll")]
        public static extern int WlanCloseHandle(IntPtr hClientHandle, IntPtr pReserved);

        [DllImport("wlanapi.dll")]
        public static extern int WlanEnumInterfaces(IntPtr hClientHandle, IntPtr pReserved, out IntPtr ppInterfaceList);

        [DllImport("wlanapi.dll")]
        public static extern int WlanScan(IntPtr hClientHandle, ref Guid pInterfaceGuid, IntPtr pDot11Ssid, IntPtr pIeData, IntPtr pReserved);

        [DllImport("wlanapi.dll")]
        public static extern void WlanFreeMemory(IntPtr pMemory);

        [StructLayout(LayoutKind.Sequential)]
        public struct WLAN_INTERFACE_INFO_LIST {
            public uint dwNumberOfItems;
            public uint dwIndex;
            public WLAN_INTERFACE_INFO InterfaceInfo;
        }

        [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
        public struct WLAN_INTERFACE_INFO {
            public Guid InterfaceGuid;
            [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
            public string strInterfaceDescription;
            public int isState;
        }

        static void Main(string[] args) {
            // 1. Trigger hardware RF probe scan on all wireless adapters
            IntPtr handle;
            uint negotiatedVersion;
            if (WlanOpenHandle(2, IntPtr.Zero, out negotiatedVersion, out handle) == 0) {
                try {
                    IntPtr pList;
                    if (WlanEnumInterfaces(handle, IntPtr.Zero, out pList) == 0) {
                        WLAN_INTERFACE_INFO_LIST list = (WLAN_INTERFACE_INFO_LIST)Marshal.PtrToStructure(pList, typeof(WLAN_INTERFACE_INFO_LIST));
                        IntPtr pItem = new IntPtr(pList.ToInt64() + 8);
                        for (int i = 0; i < list.dwNumberOfItems; i++) {
                            WLAN_INTERFACE_INFO info = (WLAN_INTERFACE_INFO)Marshal.PtrToStructure(pItem, typeof(WLAN_INTERFACE_INFO));
                            Guid g = info.InterfaceGuid;
                            WlanScan(handle, ref g, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero);
                            pItem = new IntPtr(pItem.ToInt64() + Marshal.SizeOf(typeof(WLAN_INTERFACE_INFO)));
                        }
                        WlanFreeMemory(pList);
                    }
                } catch {
                } finally {
                    WlanCloseHandle(handle, IntPtr.Zero);
                }
            }

            // 2. Short wait for Wi-Fi card adapter beacon responses
            Thread.Sleep(200);

            // 3. Execute netsh and output directly to stdout
            try {
                ProcessStartInfo psi = new ProcessStartInfo {
                    FileName = "netsh.exe",
                    Arguments = "wlan show networks mode=bssid",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true,
                    StandardOutputEncoding = System.Text.Encoding.UTF8
                };
                using (Process proc = Process.Start(psi)) {
                    string output = proc.StandardOutput.ReadToEnd();
                    proc.WaitForExit();
                    Console.Write(output);
                }
            } catch (Exception ex) {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
