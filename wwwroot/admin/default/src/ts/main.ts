// Runs on both web browsers and Node.js
//
// Licensed under the Apache License 2.0
// Copyright (c) 2014-2020 SoftEther VPN Project

// On the web browser uncomment below imports as necessary to support old browsers.
import "core-js/es/promise";
import "core-js/es/string";
import "whatwg-fetch";

import $ = require('jquery');

// Import the vpnrpc.ts RPC stub.
import * as VPN from "vpnrpc/dist/vpnrpc";

// Output JSON-RPC request / reply strings to the debug console.
VPN.VpnServerRpc.SetDebugMode(true);

let api: VPN.VpnServerRpc;


// Creating the VpnServerRpc class instance here.
if (VPN.VpnServerRpc.IsNodeJS() === false) // // Determine if this JavaScript environment is on the Node.js or not
{
    // On the web browser. We do not need to specify any hostname, port or credential as the web browser already knows it.
    api = new VPN.VpnServerRpc();
}
else
{
    // On the Node.js. We need to specify the target VPN Server's hostname, port and credential.
    api = new VPN.VpnServerRpc("127.0.0.1", 443, "", "PASSWORD_HERE", false);
}


/** API test for 'Test', test RPC function */
export async function Test_Test(): Promise<void>
{
    console.log("Begin: Test_Test");
    let a: VPN.VpnRpcTest = new VPN.VpnRpcTest(
        {
            IntValue_u32: 12345,
        });
    let b: VPN.VpnRpcTest = await api.Test(a);
    console.log(b);
    console.log("End: Test_Test");
    console.log("-----");
    console.log();
}

export async function ListVirtualHubs(id: string): Promise<void>
{
    let ul: JQuery<HTMLElement> = $(id);

    ul.children().remove();

    let hubList = await api.EnumHub();

    hubList.HubList.forEach(hub =>
    {
        ul.append("<a class=\"btn btn-primary btn-lg m-1\" href='./hub.html?" + hub.HubName_str + "'>" + hub.HubName_str + "</a>");
    });
}

export async function ShowVpnServerInfo(idInfo: string, idStatus: string): Promise<void>
{
    let infoList = $(idInfo);
    let statusList = $(idStatus);

    let serverInfo = await api.GetServerInfo();

    let serverStatus = await api.GetServerStatus();

    Object.keys(serverInfo).forEach(key =>
    {
        if(key == "ServerType_u32"){
          switch((<any>serverInfo)[key] ){
            case 0: {
              (<any>serverInfo)[key]  = "Standalone server";
              break;
            }
            case 1: {
              (<any>serverInfo)[key]  = "Cluster controller server";
              break;
            }
            case 2: {
              (<any>serverInfo)[key]  = "Cluster member server";
              break;
            }
          }
        }
        //infoList.append("<li>" + key + ": \"" + (<any>serverInfo)[key] + "\"</li>");
        infoList.append("<tr><th scope=\"row\">" + key + "</th><td>" + (<any>serverInfo)[key] + "</td></tr>");
    });

    Object.keys(serverStatus).forEach(key =>
    {
        if(key == "ServerType_u32"){
          switch((<any>serverStatus)[key]){
            case 0: {
              (<any>serverStatus)[key] = "Standalone server";
              break;
            }
            case 1: {
              (<any>serverStatus)[key] = "Cluster controller server";
              break;
            }
            case 2: {
              (<any>serverStatus)[key] = "Cluster member server";
              break;
            }
          }
        }
        //statusList.append("<li>" + key + ": \"" + (<any>serverStatus)[key] + "\"</li>");
        statusList.append("<tr><th scope=\"row\">" + key + "</th><td>" + (<any>serverStatus)[key] + "</td></tr>");
    });
}

export async function CreateNewHub(hubName: string, idList: string, passwd: string): Promise<void>
{
    if (hubName == null || hubName == "")
    {
        alert("Virtual Hub name is empty.");
        return;
    }

    try
    {
        let param: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub(
            {
                HubName_str: hubName,
                AdminPasswordPlainText_str: passwd,
                Online_bool: true,
                HubType_u32: VPN.VpnRpcHubType.Standalone,
            });

        await api.CreateHub(param);

        ListVirtualHubs(idList);

        alert("The Virtual Hub '" + hubName + "' is created.");
    }
    catch (ex)
    {
        alert(ex);
    }
}

function ConcatKeysToHtml(obj: any): string
{
    let ret: string = "";

    Object.keys(obj).forEach(key =>
    {
        if(key == "HubType_u32"){
          switch((<any>obj)[key]){
            case 0: {
              (<any>obj)[key] = "Standalone";
              break;
            }
            case 1: {
              (<any>obj)[key] = "Static Hub";
              break;
            }
            case 2: {
              (<any>obj)[key] = "Dynamic Hub";
              break;
            }
          }
        }
        ret += "<tr><th scope=\"row\">" + key + "</th> <td>" + (<any>obj)[key] + "</td></tr>";

    });

    return ret;
}

export async function DeleteVirtualHub(queryString: string): Promise<void>
{
    let hubNameInput = queryString;
    if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

    try
    {
        let deleteHubParam: VPN.VpnRpcDeleteHub = new VPN.VpnRpcDeleteHub(
            {
                HubName_str: hubNameInput,
            });

        await api.DeleteHub(deleteHubParam);

        alert("The Virtual Hub '" + hubNameInput + "' is deleted.");

        window.location.href = "./";
    }
    catch (ex)
    {
        alert(ex);
    }
}

export async function HubTest(queryString: string): Promise<void>
{
    let hubNameInput = queryString;
    if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
    let btn: JQuery<HTMLElement> = $("#HUB_BTN");

    try
    {
        let getHubParam: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub(
            {
                HubName_str: hubNameInput,
            });

        let hubInfo = await api.GetHub(getHubParam);

        $("#HUB_NAME").append("Virtual Hub \"" + hubInfo.HubName_str + "\"");
        //Hub buttons
        btn.append("<button type=\"button\" class=\"btn btn-primary mr-2 mt-1\" onclick=\"window.location.href =\'./hub_manage.hrml?" + hubInfo.HubName_str + "\'\" disabled>Manage Virtual Hub</button>");
        if(hubInfo.Online_bool == true){
          btn.append("<button type=\"button\" class=\"btn btn-success mr-2 mt-1\" onclick=\"JS.HubOnline('" + hubInfo.HubName_str + "')\" disabled>Online</button>");
          btn.append("<button type=\"button\" class=\"btn btn-warning mr-2 mt-1\" onclick=\"JS.HubOffline('" + hubInfo.HubName_str + "')\">Offline</button>");
        }
        else{
          btn.append("<button type=\"button\" class=\"btn btn-success mr-2 mt-1\" onclick=\"JS.HubOnline('" + hubInfo.HubName_str + "')\">Online</button>");
          btn.append("<button type=\"button\" class=\"btn btn-warning mr-2 mt-1\" onclick=\"JS.HubOffline('" + hubInfo.HubName_str + "')\" disabled>Offline</button>");
        }
        btn.append("<button type=\"button\" class=\"btn btn-secondary mr-2 mt-1\" onclick=\"window.location = \'./hub_properties.html?" + hubInfo.HubName_str + "\'\">Properties</button>");
        btn.append("<button type=\"button\" class=\"btn btn-danger mt-1\" onclick=\"JS.DeleteVirtualHub(location.search);\">Delete this Virtual Hub</button>");
    }
    catch (ex)
    {
        alert(ex);
    }
}

export async function HubAdminPage(queryString: string): Promise<void>
{
    let hubNameInput = queryString;
    if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
    let btn: JQuery<HTMLElement> = $("#HUB_BTN");

    try
    {
        let getHubParam: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub(
            {
                HubName_str: hubNameInput,
            });

        let hubInfo = await api.GetHub(getHubParam);

        $("#HUB_NAME").append("Virtual Hub \"" + hubInfo.HubName_str + "\"");
        $("#COLLAPSE").attr("style", "");
        //Hub buttons
        btn.append("<button type=\"button\" class=\"btn btn-primary mr-2 mt-1\" onclick=\"window.location.href =\'./hub_manage.hrml?" + hubInfo.HubName_str + "\'\" disabled>Manage Virtual Hub</button>");
        if(hubInfo.Online_bool == true){
          btn.append("<button type=\"button\" class=\"btn btn-success mr-2 mt-1\" onclick=\"JS.HubOnline('" + hubInfo.HubName_str + "')\" disabled>Online</button>");
          btn.append("<button type=\"button\" class=\"btn btn-warning mr-2 mt-1\" onclick=\"JS.HubOffline('" + hubInfo.HubName_str + "')\">Offline</button>");
        }
        else{
          btn.append("<button type=\"button\" class=\"btn btn-success mr-2 mt-1\" onclick=\"JS.HubOnline('" + hubInfo.HubName_str + "')\">Online</button>");
          btn.append("<button type=\"button\" class=\"btn btn-warning mr-2 mt-1\" onclick=\"JS.HubOffline('" + hubInfo.HubName_str + "')\" disabled>Offline</button>");
        }
        btn.append("<button type=\"button\" class=\"btn btn-secondary mr-2 mt-1\" onclick=\"window.location = \'./hub_properties.html?" + hubInfo.HubName_str + "\'\">Properties</button>");
        btn.append("<button type=\"button\" class=\"btn btn-danger mt-1\" onclick=\"JS.DeleteVirtualHub(location.search);\">Delete this Virtual Hub</button>");
        // User list
        let enumUserParam: VPN.VpnRpcEnumUser = new VPN.VpnRpcEnumUser(
            {
                HubName_str: hubInfo.HubName_str,
            });

        let enumUserRet = await api.EnumUser(enumUserParam);

        let userListHtmlItem: JQuery<HTMLElement> = $("#USERS_LIST");

        enumUserRet.UserList.forEach(user =>
        {
            userListHtmlItem.append("<li><a class=\"btn btn-primary\" data-toggle=\"collapse\" href=\"#" + user.Name_str + "\" role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseExample\"><strong>" + user.Name_str + "</strong></a><div class=\"overflow-auto\"><BR><div class=\"collapse\" id=\"" + user.Name_str + "\"><table class=\"table table-hover overflow-auto\"><thread><th scope=\"col\">Item</th><th scope=\"col\">Value</th></thread><tbody>" + ConcatKeysToHtml(user) + "</tbody></div></table></div></li>");
        });

        // Sessions list
        let enumSessionParam: VPN.VpnRpcEnumSession = new VPN.VpnRpcEnumSession(
            {
                HubName_str: hubInfo.HubName_str,
            });

        let enumSessionsRet = await api.EnumSession(enumSessionParam);

        let sessionListHtmlItem = $("#SESSIONS_LIST");

        enumSessionsRet.SessionList.forEach(session =>
        {
            sessionListHtmlItem.append("<li><a class=\"btn btn-primary\" data-toggle=\"collapse\" href=\"#" + session.Name_str + "\" role=\"button\" aria-expanded=\"false\" aria-controls=\"collapseExample\"><strong>" + session.Name_str + "</strong></a><div class=\"overflow-auto\"><BR><div class=\"collapse\" id=\"" + session.Name_str + "\"><table class=\"table table-hover\"><thread><th scope=\"col\">Item</th><th scope=\"col\">Value</th></thread><tbody>" + ConcatKeysToHtml(session) + "</tbody></table></div></div></li>");
        });
        //Hub Status
        let getHubStatus: VPN.VpnRpcHubStatus = new VPN.VpnRpcHubStatus(
            {
                HubName_str: hubNameInput,
            });
        let hubStatus = await api.GetHubStatus(getHubStatus);
        $("#HUB_STATUS").append("<div class=\"overflow-auto\"><table class=\"table table-hover\"><thread><th scope=\"col\">Item</th><th scope=\"col\">Value</th></thread><tbody>" + ConcatKeysToHtml(hubStatus) + "</tbody></table></div>");
    }
    catch (ex)
    {
        alert(ex);
    }
}


export async function HubPropertiesPage(queryString: string): Promise<void>
{
    let hubNameInput = queryString;
    if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

    try
    {
        let getHubStatus: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub(
            {
                HubName_str: hubNameInput,
            });
        let hubStatus = await api.GetHub(getHubStatus);

        //Online/Offline Radio Toggle
        if(hubStatus.Online_bool == true){
          $("#HUB_ON").append("<input class=\"form-check-input\" type=\"radio\" name=\"online\" value=\"yes\" id=\"Online\" checked onclick=\"$('#on').empty(); $('#on').val('true')\"><label class=\"form-check-label\" for=\"Online\">Online</label>");
          $("#HUB_OFF").append("<input class=\"form-check-input\" type=\"radio\" name=\"online\" value=\"no\" id=\"Offline\" onclick=\"$('#on').empty(); $('#on').val('false')\"><label class=\"form-check-label\" for=\"Offline\">Offline</label>");
          $('#on').val('true');
        }
        else {
          $("#HUB_ON").append("<input class=\"form-check-input\" type=\"radio\" name=\"online\" value=\"yes\" id=\"Online\" onclick=\"$('#on').empty(); $('#on').val('true')\"><label class=\"form-check-label\" for=\"Online\">Online</label>");
          $("#HUB_OFF").append("<input class=\"form-check-input\" type=\"radio\" name=\"online\" value=\"no\" id=\"Offline\" checked onclick=\"$('#on').empty(); $('#on').val('false')\"><label class=\"form-check-label\" for=\"Offline\">Offline</label>");
          $('#on').val('false');
        }
        //No Enum
        if(hubStatus.NoEnum_bool == true){
          $("#NOENUM").append("<input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"EnumAnon\" checked onclick=\"$('#NO_ENUM').empty(); $('#NO_ENUM').val('false')\">");
          $('#NO_ENUM').val('true');
        }
        else{
          $("#NOENUM").append("<input class=\"form-check-input\" type=\"checkbox\" value=\"\" id=\"EnumAnon\" onclick=\"$('#NO_ENUM').empty(); $('#NO_ENUM').val('true')\">");
          $('#NO_ENUM').val('false');
        }
        //Max Sessions
        $("#MAX_S").append("Max Number of Sessions (0 for unlimited): <input class=\"form-control\" id=\"MAX_SESSIONS\" aria-describedby=\"maximumSessions\" placeholder=\"" + hubStatus.MaxSession_u32 + "\"/>")
        $('#MAX_SESSIONS').val(hubStatus.MaxSession_u32);
        //Go back to hub
        $("#END_BTN").append("<button class=\"btn btn-secondary\" type=\"button\" onclick=\"window.location.href = './hub.html?" + hubNameInput + "'; JS.cleartwk()\">Go to hub</button>");
        $("#END_BTN").append("<button class=\"btn btn-secondary\" type=\"button\" onclick=\"window.location.href = './hub_manage.html?" + hubNameInput + "'; JS.cleartwk()\">Go to hub management</button>");
        //Cluster Mode Type
        let getHubMode: VPN.VpnRpcHubStatus = new VPN.VpnRpcHubStatus(
            {
                HubName_str: hubNameInput,
            });
        let hubMode = await api.GetHubStatus(getHubMode);
        $("#HUB_MODE").empty();
        if(hubMode.HubType_u32 == 0){
          $("#HUB_MODE").append("Currently the server is operating in Standalone Mode.This virtual Hub is operating as Standalone Hub.");
        }
        else if (hubStatus.HubType_u32 == 1){
          $("#HUB_MODE").append("This virtual Hub is operating as Static Virtual Hub.");
        }
        else{
          $("#HUB_MODE").append("This virtual Hub is operating as Dynamic Virtual Hub.");
        }

    }
    catch (ex)
    {
        alert(ex);
    }
}

export async function HubManagePage(queryString: string): Promise<void>
{
    let hubNameInput = queryString;
    if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

    let getHubParam: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub(
        {
            HubName_str: hubNameInput,
        });

    let hubInfo = await api.GetHub(getHubParam);

    $("#USERS").append("<button type=\"button\" class=\"btn btn-secondary\" onclick=\"windows.location.href = './hub_manage_users.html?" + hubInfo.HubName_str + "'\">Manage Users</button>");
    $("#END").append("<button type=\"button\" class=\"btn btn-secondary\" onclick=\"window.location.href = './hub.html?" + hubInfo.HubName_str + "'\">Back</button>");
    $("PROPERTIES").append("<button type=\"button\" class=\"btn btn-secondary\" onclick=\"window.location.href = './hub_properties.html?" + hubInfo.HubName_str + "'\">Virtual Hub Properties</button>");

    HubManagePageStatus(queryString);
}


export async function HubManagePageStatus(queryString: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  //Hub Status
  let getHubStatus: VPN.VpnRpcHubStatus = new VPN.VpnRpcHubStatus(
      {
          HubName_str: hubNameInput,
      });
  let hubStatus = await api.GetHubStatus(getHubStatus);
  $("#STATUS").append("<table class=\"table table-hover\"><thread><th scope=\"col\">Item</th><th scope=\"col\">Value</th></thread><tbody>" + ConcatKeysToHtml(hubStatus) + "</tbody></table>");
}

function AccessListsContent(obj: any): string
{
    let proto: string = "";
    let ret: string = "";
    let pre: string = "";
    let comma: string = "";
    let tcpstate: string = "";
    if(obj.IsIPv6_bool == true){
      pre = "(ipv6) ";
      obj.DestIpAddress_ip = "0.0.0.0";
      obj.DestSubnetMask_ip = "0.0.0.0";
      obj.SrcIpAddress_ip = "0.0.0.0";
      obj.SrcSubnetMask_ip = "0.0.0.0";
    }
    else{
      pre = "(ipv4) ";
    }
    if(obj.Protocol_u32 == 6){
      if(obj.CheckTcpState_bool == true){
        if(obj.Established_bool == true){
          tcpstate = ", Established";
        }
        else{
          tcpstate = ", Unestablished";
        }
      }
    }


    Object.keys(obj).forEach(key =>
    {
      //if(key != "SrcIpAddress_ip" && key != "SrcSubnetMask_ip" && key != "DestIpAddress_ip" && key != "DestSubnetMask_ip" && key != "SrcIpAddress6_bin" && key != "SrcSubnetMask6_bin" && key != "DestIpAddress6_bin" && key != "DestSubnetMask6_bin" && key != "SrcMacAddress_bin" && key != "SrcMacMask_bin" && key != "DstMacAddress_bin" && key != "DstMacMask_bin"){
        if ((<any>obj)[key] != 0 && (<any>obj)[key] != "0.0.0.0" && (<any>obj)[key] != "AAAAAAAAAAAAAAAAAAAAAA==" && (<any>obj)[key] != "AAAAAAAA" && (<any>obj)[key] != ""){
          if(key != "Id_u32" && key != "Note_utf" && key != "Active_bool" && key != "Priority_u32" && key != "Discard_bool" && key != "IsIPv6_bool" && key != "UniqueId_u32" && key != "CheckTcpState_bool" && key != "Established_bool"){
            if(key == "Protocol_u32"){
              switch((<any>obj)[key]){
                case 1: proto = "ICMP for IPv4";break;
                case 6: proto = "TCP"; break;
                case 17: proto = "UDP"; break;
                case 58: proto = "ICMP for IPv6"; break;
                default: break;
              }
              ret += comma + key + "=" + proto + tcpstate;
              if(comma != ", "){comma = ", "}
            }
            else{
              ret += comma + key + "=" + (<any>obj)[key];
              if(comma != ", "){comma = ", "}
            }
          }
        }
      //}
      else{
        if(obj.IsIPv6_bool == true){

        }
      }

    });
    if(ret != "" && ret != " " && ret != "," && ret != " ,"){
      return pre + ret;
    }
    else{
      return "(ether) *";
    }
}

export async function EnumAccessLists(queryString: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let accessHub: VPN.VpnRpcEnumAccessList = new VPN.VpnRpcEnumAccessList(
    {
      HubName_str: hubNameInput,
    });
  let accessList = await api.EnumAccess(accessHub);
  let counter: number = 0;
  let priority: number = 0;
  $("#AC_LIST").empty();
  accessList.AccessList.forEach(rule => {
    var action: string;
    var status: string;
    counter += + 1;
    if(rule.Discard_bool == false){action = "Pass"}else{action = "Discard"};
    if(rule.Active_bool == true){
      status = "Enabled";
      $("#AC_LIST").append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-primary btn-sm\" onclick=\"$('#SELECTED_ID').empty; $('#SELECTED_ID').val('" + counter + "'); $('#E_BTN').find('button').removeAttr('disabled'); $('#D').removeAttr('disabled'); $('#E').attr('disabled', true)\">" + counter + "</button></th><td>" + action + "</td><td>" + status + "</td><td>" + rule.Priority_u32 + "</td><td>" + rule.Note_utf + "</td><td>" + AccessListsContent(rule) + "</td></tr>");
    }
    else
    {status = "Disabled";
    $("#AC_LIST").append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-primary btn-sm\" onclick=\"$('#SELECTED_ID').empty; $('#SELECTED_ID').val('" + counter + "'); $('#E_BTN').find('button').removeAttr('disabled'); $('#E').removeAttr('disabled'); $('#D').attr('disabled', true)\">" + counter + "</button></th><td>" + action + "</td><td>" + status + "</td><td>" + rule.Priority_u32 + "</td><td>" + rule.Note_utf + "</td><td>" + AccessListsContent(rule) + "</td></tr>");
    }
    priority = rule.Priority_u32;
  });
  counter += + 1;
  $("#ID_PLUS").empty();
  $("#ID_PLUS").val(counter);
  $("#PRIORITY_PLUS").val(priority + 100);
}

export async function DeleteAccessItem(queryString: string, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let itemDelete: VPN.VpnRpcDeleteAccess = new VPN.VpnRpcDeleteAccess(
    {
      HubName_str: hubNameInput,
      Id_u32: id,
    });
  await api.DeleteAccess(itemDelete);
  EnumAccessLists(queryString);
}

export async function EnableDisableAccessRule(queryString: string, id: number, bool: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let accessHub: VPN.VpnRpcEnumAccessList = new VPN.VpnRpcEnumAccessList(
    {
      HubName_str: hubNameInput,
    });
  let accessList = await api.EnumAccess(accessHub);
  let modList = accessList;
  if(bool == 1){
    modList.AccessList[id-1].Active_bool = true;
  }
  else if(bool == 0){
    modList.AccessList[id-1].Active_bool = false;
  }
  await api.SetAccessList(modList);
  EnumAccessLists(queryString);
}

export async function CloneAccessRule(queryString: string, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let accessHub: VPN.VpnRpcEnumAccessList = new VPN.VpnRpcEnumAccessList(
    {
      HubName_str: hubNameInput,
    });
  let accessList = await api.EnumAccess(accessHub);
  let modList = accessList;
  modList.AccessList = modList.AccessList.concat(modList.AccessList[id-1]);

  let cloned = await api.SetAccessList(modList);
  cloned.AccessList[id].Priority_u32 += 1;
  await api.SetAccessList(cloned);
  EnumAccessLists(queryString);
}

export async function EditAccessRule(queryString: string, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  $("#ACCESS_I").empty();
  let accessHub: VPN.VpnRpcEnumAccessList = new VPN.VpnRpcEnumAccessList(
    {
      HubName_str: hubNameInput,
    });
  let accessList = await api.EnumAccess(accessHub);
  let modList = accessList;
  let obj = modList.AccessList[id-1];
  Object.keys(obj).forEach(key =>{
    if(key != "UniqueId_u32" && key != "Id_u32"){
        if(key == "DestIpAddress6_bin" || key == "DestSubnetMask6_bin" || key == "SrcIpAddress6_bin" || key == "SrcSubnetMask6_bin"){(<any>obj)[key] = window.atob((<any>obj)[key])}
        $("#ACCESS_I").append("<tr><th scope=\"row\">" + key + "</th><td><input type=\"text\" class=\"form-control\" id=\"" + key + "\"></td></tr>");
        $("#" + key).val((<any>obj)[key]);
    }
  });
}

export async function SetEditAccessRule(queryString: string, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let accessHub: VPN.VpnRpcEnumAccessList = new VPN.VpnRpcEnumAccessList(
    {
      HubName_str: hubNameInput,
    });
  let accessList = await api.EnumAccess(accessHub);
  let modList = accessList;
  let obj = modList.AccessList[id-1];
  Object.keys(obj).forEach(key =>{
    (<any>obj)[key] = $("#" + key).val();
    if(key == "DestIpAddress6_bin" || key == "DestSubnetMask6_bin" || key == "SrcIpAddress6_bin" || key == "SrcSubnetMask6_bin"){
      var encode = new TextEncoder();
      var arr = encode.encode(<any>obj[key]);
      (<any>obj)[key] = arr;
    }
  });
  modList.AccessList[id-1] = obj;
  await api.SetAccessList(modList);
  EditAccessRule(queryString, id);
}

export async function AddAccessRule(queryString: string, prio: number, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let addRule: VPN.VpnRpcAddAccess = new VPN.VpnRpcAddAccess(
    {
      HubName_str: hubNameInput,
    });
    await api.AddAccess(addRule);
    let accessHub: VPN.VpnRpcEnumAccessList = new VPN.VpnRpcEnumAccessList(
      {
        HubName_str: hubNameInput,
      });
    let accessList = await api.EnumAccess(accessHub);
    let modList = accessList;
    modList.AccessList[0].Priority_u32 = prio;
    await api.SetAccessList(modList);
    EnumAccessLists(queryString);
}

export async function HubPropertiesSet(queryString: string, passwd: string, on: boolean, maxs: number, noenum: boolean, type: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);


  try
  {
      let getHubParam: VPN.VpnRpcCreateHub = new VPN.VpnRpcCreateHub(
          {
              HubName_str: hubNameInput,
              AdminPasswordPlainText_str: passwd,
              Online_bool: on,
              MaxSession_u32: maxs,
              NoEnum_bool: noenum,
              HubType_u32: type,
          });

      await api.SetHub(getHubParam);
      window.location.reload();
  }

  catch (ex)
  {
      alert(ex);
  }
}

export async function ListListeners(id: string): Promise<void>
{
    let li: JQuery<HTMLElement> = $(id);

    li.children().remove();

    let lisList = await api.EnumListener();
    $("#BTN_LIS").find("button").attr("disabled", "true");
    $("#DIS").find("button").attr("disabled", "true");
    $("#ENE").find("button").attr("disabled", "true");
    lisList.ListenerList.forEach(port =>
    {
      let str: string = "";
        if(port.Enables_bool == true){
          str = "$('#DIS').find('button').removeAttr('disabled'); $('#ENE').find('button').attr('disabled', 'true')";
        }
        else{
          str = "$('#ENE').find('button').removeAttr('disabled'); $('#DIS').find('button').attr('disabled', 'true')";
        }
        li.append("<tr><th scope=\"row\">TCP <button type=\"button\" class=\"btn btn-link\" onclick=\"$(\'#PORT_L\').val(+" + port.Ports_u32 + "); $('#BTN_LIS').find('button').removeAttr('disabled'); " + str + "\">" + port.Ports_u32 + "</button></th> <td>" + port.Enables_bool + "</td><td>" + port.Errors_bool + "</td></tr>");

    });
}


export async function CreateNewListener(lisPort: number, idLis: string): Promise<void>
{
    if (lisPort < 1 && lisPort > 65535 )
    {
        alert("Invalid port number.");
        return;
    }

    try
    {
        let param: VPN.VpnRpcListener = new VPN.VpnRpcListener(
            {
                Port_u32: lisPort,
                Enable_bool: true,
            });

        await api.CreateListener(param);
        ListListeners(idLis);
        alert("The Listener TCP/IP '" + lisPort + "' has been created.");
    }
    catch (ex)
    {
        alert(ex);
    }
}

export async function DeleteListener(lisPort: number, idLis: string): Promise<void>
{

  try
  {
      let param: VPN.VpnRpcListener = new VPN.VpnRpcListener(
          {
              Port_u32: lisPort,
          });

      await api.DeleteListener(param);
      ListListeners(idLis);
      alert("The Listener TCP/IP '" + lisPort + "' has been deleted.");
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function EnableListener(lisPort: number, idLis: string): Promise<void>
{

  try
  {
      let param: VPN.VpnRpcListener = new VPN.VpnRpcListener(
          {
              Port_u32: lisPort,
              Enable_bool: true,
          });

      await api.EnableListener(param);
      ListListeners(idLis);
      alert("The Listener TCP/IP '" + lisPort + "' has been enabled.");
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function DisableListener(lisPort: number, idLis: string): Promise<void>
{

  try
  {
      let param: VPN.VpnRpcListener = new VPN.VpnRpcListener(
          {
              Port_u32: lisPort,
              Enable_bool: false,
          });

      await api.EnableListener(param);
      ListListeners(idLis);
      alert("The Listener TCP/IP '" + lisPort + "' has been disabled.");
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function ListConnections(id: string): Promise<void>
{
    let li: JQuery<HTMLElement> = $(id);

    li.children().remove();

    let lisConn = await api.EnumConnection();

    lisConn.ConnectionList.forEach(connection =>
    {
        li.append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-link\" onclick=\"$(\'#CONNECTION\').val(\'" + connection.Name_str + "\')\">" + connection.Name_str + "</button></th> <td>" + connection.Hostname_str + "</td><td>" + connection.Ip_ip + "</td><td>" + connection.Port_u32 + "</td><td>" + connection.ConnectedTime_dt + "</td><td>" + connection.Type_u32 + "</td></tr>");
    });
}

export async function ConnectionInfo(connection: string): Promise<void>
{
  let li: JQuery<HTMLElement> = $(connection);

  li.children().remove();
  try
  {
    let getConStatus: VPN.VpnRpcConnectionInfo = new VPN.VpnRpcConnectionInfo(
        {
            Name_str: connection,
        });

    let conInfo = await api.GetConnectionInfo(getConStatus);
    $("#CONNECTION_INFO_NAME").append("Connection \"" + conInfo.Name_str + "\" Information");
    $("#CONNECTION_INFO").append("<table class=\"table table-hover\"><thread><th scope=\"col\">Item</th><th scope=\"col\">Value</th></thread><tbody>" + ConcatKeysToHtml(conInfo) + "</tbody></table></li>");


  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function Disconnection(con: string, conList: string): Promise<void>
{

  try
  {
      let param: VPN.VpnRpcConnectionInfo = new VPN.VpnRpcConnectionInfo(
          {
              Name_str: con,
          });

      await api.DisconnectConnection(param);
      ListConnections(conList);
      alert("The Connection'" + con + "' has been terminated.");
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function HubOnline(hubName: string): Promise<void>
{

  try
  {
      let param: VPN.VpnRpcSetHubOnline = new VPN.VpnRpcSetHubOnline(
          {
              HubName_str: hubName,
              Online_bool: true,
          });

      await api.SetHubOnline(param);
      alert("The '" + hubName + "' has been set online.");
      window.location.reload();
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function HubOffline(hubName: string): Promise<void>
{

  try
  {
      let param: VPN.VpnRpcSetHubOnline = new VPN.VpnRpcSetHubOnline(
          {
              HubName_str: hubName,
              Online_bool: false,
          });

      await api.SetHubOnline(param);
      alert("The '" + hubName + "' has been set offline.");
      window.location.reload();
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function ExtendedHubInfo(queryString: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let li: JQuery<HTMLElement> = $("#EO_LIST");

  li.children().remove();

  try
  {
    let getHubParam: VPN.VpnRpcAdminOption = new VPN.VpnRpcAdminOption(
        {
            HubName_str: hubNameInput,
        });
    let elist = await api.GetHubExtOptions(getHubParam);
    $("#VHUB").empty();
    $("#VHUB").append(getHubParam.HubName_str);

    elist.AdminOptionList.forEach(value =>{
      li.append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-link\" onclick=\"$('#EODESCR').empty(); JS.ExtendedHubInfoDescription('" + getHubParam.HubName_str + "', '" + value.Name_str + "');$('#MOD_VAL_NAME').empty();$('#MOD_VAL_NAME').text('" + value.Name_str + "');$('#MOD_VAL').empty();$('#MOD_VAL').val('" + value.Value_u32 + "');\">" + value.Name_str + "</button></th> <td>" + value.Value_u32 + "</td></tr>")
    });


  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function ExtendedHubInfoDescription(vhub: string, eo: string): Promise<void>
{
  let li: JQuery<HTMLElement> = $("#EODESCR");

  li.children().remove();
  let getHubParam: VPN.VpnRpcAdminOption = new VPN.VpnRpcAdminOption(
      {
          HubName_str: vhub,
      });
  let descr = await api.GetHubExtOptions(getHubParam);

  descr.AdminOptionList.forEach(value =>{
    if (value.Name_str == eo){
      li.append(value.Descrption_utf);
    }
  });


}

export async function ExtendedHubSet(vhub: string, name: string, value: number): Promise<void>
{
  let hubNameInput = vhub;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let setParam = [
    {"Name_str": name, "Value_u32": value, "Descrption_utf": "descrption"},
  ]
  let setHubParam: VPN.VpnRpcAdminOption = new VPN.VpnRpcAdminOption(
      {
          HubName_str: hubNameInput,
          AdminOptionList: setParam,
      });

  await api.SetHubExtOptions(setHubParam);
}

export async function AdminOptionsInfo(queryString: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let li: JQuery<HTMLElement> = $("#AO_LIST");

  li.children().remove();

  try
  {
    let getHubParam: VPN.VpnRpcAdminOption = new VPN.VpnRpcAdminOption(
        {
            HubName_str: hubNameInput,
        });
    let elist = await api.GetHubAdminOptions(getHubParam);
    $("#VHUB_1").empty();
    $("#VHUB_1").append(getHubParam.HubName_str);

    elist.AdminOptionList.forEach(value =>{
      li.append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-link\" onclick=\"$('#AODESCR').empty(); JS.AdminOptionsInfoDescription('" + getHubParam.HubName_str + "', '" + value.Name_str + "');$('#AOMOD_VAL_NAME').empty();$('#AOMOD_VAL_NAME').text('" + value.Name_str + "');$('#AOMOD_VAL').empty();$('#AOMOD_VAL').val('" + value.Value_u32 + "');\">" + value.Name_str + "</button></th> <td>" + value.Value_u32 + "</td></tr>")
    });


  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function AdminOptionsInfoDescription(vhub: string, eo: string): Promise<void>
{
  let li: JQuery<HTMLElement> = $("#AODESCR");

  li.children().remove();
  let getHubParam: VPN.VpnRpcAdminOption = new VPN.VpnRpcAdminOption(
      {
          HubName_str: vhub,
      });
  let descr = await api.GetHubAdminOptions(getHubParam);

  descr.AdminOptionList.forEach(value =>{
    if (value.Name_str == eo){
      li.append(value.Descrption_utf);
    }
  });


}

export async function AdminOptionsSet(vhub: string, name: string, value: number): Promise<void>
{
  let hubNameInput = vhub;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let setParam = [
    {"Name_str": name, "Value_u32": value, "Descrption_utf": "descrption"},
  ]
  let setHubParam: VPN.VpnRpcAdminOption = new VPN.VpnRpcAdminOption(
      {
          HubName_str: hubNameInput,
          AdminOptionList: setParam,
      });

  await api.SetHubAdminOptions(setHubParam);
}

export async function EnumerateAc(queryString: string): Promise<void>
{
    let hubNameInput = queryString;
    if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
    let al: JQuery<HTMLElement> = $("#AL");

    al.children().remove();

    let eAc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
      {
        HubName_str: hubNameInput,
      });
    let alist = await api.GetAcList(eAc);
    var c: number;
    var p: number;
    p = 0;
    c = 0;
    alist.ACList.forEach(value =>{
      var action: string;
      var subnet: string;
      subnet = "";
      if (value.Deny_bool == true){action = "Deny"} else {action = "Pass"};
      if (value.Masked_bool == true) {subnet = "/" + value.SubnetMask_ip};
      al.append("<tr><th scope=\"row\"><button class=\"btn btn-primary btn-sm\" type=\"button\" onclick=\"$('#RN').empty(); $('#RN').val("+ value.Id_u32 +")\">" + value.Id_u32 + "</button></th><td>" + value.Priority_u32 + "</td><td>" + action + "</td><td>" + value.IpAddress_ip + subnet + "</td></tr>");

    });

    $("#RNL").val(alist.ACList.length);
}

export async function SelectAc(queryString: string, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let eAc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
    {
      HubName_str: hubNameInput,
    });
  let alist = await api.GetAcList(eAc);
  $("#I_NETMASK").empty();
  $("#IPADDR").empty();
  $("#IPADDR").val(alist.ACList[id-1].IpAddress_ip);
  if(alist.ACList[id-1].Masked_bool == true){
    $("#CHECKNM").text('true');
    $("#CHECKNM_C").append("<input type=\"checkbox\" class=\"form-check-input\" id=\"CNETM\" onclick=\"$('#CHECKNM').empty(); $('#CHECKNM').text('false')\" checked>");
    $("#I_NETMASK").append("<input type=\"text\" class=\"form-control\" id=\"NETMASK\">");
  }
  else {
    $("#CHECKNM").text('false');
    $("#CHECKNM_C").append("<input type=\"checkbox\" class=\"form-check-input\" id=\"CNETM\" onclick=\"document.getElementById('NETMASK').removeAttribute('disabled'); $('#CHECKNM').empty(); $('#CHECKNM').text('true') \">");
    $("#I_NETMASK").append("<input type=\"text\" class=\"form-control\" id=\"NETMASK\" disabled>");
  }
  if(alist.ACList[id-1].Deny_bool == true){
    $("#BOOLD").text('true');
    $("#B_A").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"permit\" onclick=\"$('#BOOLD').empty(); $('#BOOLD').text('false')\">");
    $("#B_D").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"deny\" checked>");
  }
  else{
    $("#BOOLD").text('false');
    $("#B_A").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"permit\" checked>");
    $("#B_D").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"deny\" onclick=\"$('#BOOLD').empty(); $('#BOOLD').text('true')\">");
  }
  $("#PRIORITY").empty();
  $("#PRIORITY").val(alist.ACList[id-1].Priority_u32);
  $("#NETMASK").empty();
  $("#NETMASK").val(alist.ACList[id-1].SubnetMask_ip);
}

export async function SetAc(queryString: string, id: number, prio: number, deny: boolean, masked: boolean, ip: string, subnet: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let eAcc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
    {
      HubName_str: hubNameInput,
    });
  let alist = await api.GetAcList(eAcc);

  alist.ACList.splice(id-1, 1 , {"Id_u32": id, "Priority_u32": prio, "Deny_bool": deny, "Masked_bool": masked, "IpAddress_ip": ip, "SubnetMask_ip": subnet});


  await api.SetAcList(alist);
  EnumerateAc(queryString);
}

export async function AddAc(queryString: string, id: number, prio: number, deny: boolean, masked: boolean, ip: string, subnet: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let eAcc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
    {
      HubName_str: hubNameInput,
    });
  let alist = await api.GetAcList(eAcc);

  let set = [
    {"Id_u32": id, "Priority_u32": prio, "Deny_bool": deny, "Masked_bool": masked, "IpAddress_ip": ip,"SubnetMask_ip": subnet}
  ];
  let newA = alist.ACList.concat(set);
  let eAc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
    {
      HubName_str: hubNameInput,
      ACList: newA,
    });
  await api.SetAcList(eAc);
  EnumerateAc(queryString);
}

export async function DelAc(queryString: string, id: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let eAcc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
    {
      HubName_str: hubNameInput,
    });
  let alist = await api.GetAcList(eAcc);

  alist.ACList.splice(id-1, 1);


  await api.SetAcList(alist);
  EnumerateAc(queryString);
}

export async function MsgGet(queryString: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let msgParam: VPN.VpnRpcMsg = new VPN.VpnRpcMsg(
    {
      HubName_str: hubNameInput,
    });
  let msg = await api.GetHubMsg(msgParam);
  let m: JQuery<HTMLElement> = $("#MSGINPUT");

  m.children().remove();
  // Define the string
  var emsg = msg.Msg_bin.toString();

  // Decode the String
  var dmsg = atob(emsg);
  m.append(dmsg);
}


export async function MsgSet(queryString: string, msg: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  console.log(msg);
  var encode = new TextEncoder();
  var arr = encode.encode(msg);
  console.log(arr);
  let msgParam: VPN.VpnRpcMsg = new VPN.VpnRpcMsg(
    {
      HubName_str: hubNameInput,
      Msg_bin: arr,
    });
  await api.SetHubMsg(msgParam);
}
