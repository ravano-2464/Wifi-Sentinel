# Trigger Active Hardware Wi-Fi Scan using Windows Native WLAN API
$source = @"
using System;
using System.Runtime.InteropServices;
public class NativeWifiScan {
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

    public static bool Scan() {
        IntPtr handle;
        uint negotiatedVersion;
        if (WlanOpenHandle(2, IntPtr.Zero, out negotiatedVersion, out handle) != 0) return false;
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
                return true;
            }
        } catch {
            return false;
        } finally {
            WlanCloseHandle(handle, IntPtr.Zero);
        }
        return false;
    }
}
"@

try {
    Add-Type -TypeDefinition $source -Language CSharp
    [NativeWifiScan]::Scan() | Out-Null
    Start-Sleep -Milliseconds 1200
} catch {
    # Fallback
}

netsh wlan show networks mode=bssid
