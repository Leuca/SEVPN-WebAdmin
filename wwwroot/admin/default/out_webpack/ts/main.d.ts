import "core-js/es/promise";
import "core-js/es/string";
import "whatwg-fetch";
/** API test for 'Test', test RPC function */
export declare function Test_Test(): Promise<void>;
export declare function ListVirtualHubs(id: string): Promise<void>;
export declare function ShowVpnServerInfo(idInfo: string, idStatus: string): Promise<void>;
export declare function CreateNewHub(hubName: string, idList: string): Promise<void>;
export declare function DeleteVirtualHub(queryString: string): Promise<void>;
export declare function HubAdminPage(queryString: string): Promise<void>;
export declare function VirtualHubStatus(idHub: string): Promise<void>;
export declare function ListListeners(id: string): Promise<void>;
export declare function CreateNewListener(lisPort: number): Promise<void>;
//# sourceMappingURL=main.d.ts.map