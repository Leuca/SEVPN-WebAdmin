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
/** From this line on code has been modified. New code has been made following the one originally found at
https://github.com/SoftEtherVPN/SoftEtherVPN/blob/master/src/bin/hamcore/wwwroot/admin/default/src/ts/main.ts **/
// Licensed under the Apache License 2.0
// Copyright (c) 2020 Luca Magrone
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
        btn.append("<button type=\"button\" class=\"btn btn-primary mr-2 mt-1\" onclick=\"window.location.href =\'./hub_manage.html?" + hubInfo.HubName_str + "\'\">Manage Virtual Hub</button>");
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

export async function ListUsers(queryString: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let li: JQuery<HTMLElement> = $("#UBODY");
  li.empty();
  let hub: JQuery<HTMLElement> = $("#VHUB_U");
  hub.empty();
  hub.append(hubNameInput);

  let getusers: VPN.VpnRpcEnumUser = new VPN.VpnRpcEnumUser(
    {
      HubName_str: hubNameInput,
    });
  let users = await api.EnumUser(getusers);
  users.UserList.forEach(user =>{
    let auth: string = "";
    let expiration: any;
    switch(user.AuthType_u32){
      case 0: auth = "Anonymous authentication"; break;
      case 1: auth = "Password authentication"; break;
      case 2: auth = "User certificate authentication"; break;
      case 3: auth = "Root certificate which is issued by trusted Certificate Authority"; break;
      case 4: auth = "Radius authentication"; break;
      case 5: auth = "Windows NT authentication"; break;
    }
    if(user.Expires_dt.toString() == "1970-01-01T09:00:00.000Z"){
      expiration = "No Expiration";
    }
    else{
      expiration = user.Expires_dt;
    }
    let date: Date;
    li.append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-primary\" onclick=\"$('#USER_C').val('" + user.Name_str + "'); $('#U_BTN').find('button').removeAttr('disabled')\">" + user.Name_str + "</button></th><td>" + user.Realname_utf + "</td><td>" + user.GroupName_str + "</td><td>" + user.Note_utf + "</td><td>" + auth + "</td><td>" + user.NumLogin_u32 + "</td><td>" + user.LastLoginTime_dt + "</td><td>" + expiration + "</td><td>" + (user["Ex.Recv.BroadcastBytes_u64"] + user["Ex.Send.BroadcastBytes_u64"]) + "</td><td>" + (user["Ex.Recv.BroadcastCount_u64"] + user["Ex.Send.BroadcastCount_u64"]) + "</td></tr>");
  });
}

function toHex(str: string) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

export async function FetchUser(queryString: string, name: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);


  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: name,
    });
  let user = await api.GetUser(userItem);
  $("#username").empty();
  $("#username").append(user.Name_str);

  if(user.ExpireTime_dt.toString() == "1970-01-01T09:00:00.000Z"){
    $("#dateCheckBox").removeAttr("checked");
    $("#dateM").attr("disabled", "true");
    $("#dateY").attr("disabled", "true");
    $("#dateD").attr("disabled", "true");
  }
  else{
    let date= new Date( user.ExpireTime_dt.toString());
    let m = date.getMonth()+1;
    let d = date.getDate();
    let y = date.getFullYear();
    $("#dateCheckBox").attr("checked", "true");
    $("#dateM").val(m);
    $("#dateD").val(d);
    $("#dateY").val(y);
    $("#dateM").removeAttr("disabled");
    $("#dateY").removeAttr("disabled");
    $("#dateD").removeAttr("disabled");
  }
  $("#USERNAME").val(name);
  $("#FULLNAME").val(user.Realname_utf);
  $("#NOTE").val(user.Note_utf);
  $("#GROUPNAME").val(user.GroupName_str);
  if(user.AuthType_u32 == 5){
    if(user.NtUsername_utf.toString()==""){
      $("#AuthNameC").removeAttr("checked");
      $("#AuthNameI").attr("disabled","true");
    }
    else{
      $("#AuthNameC").attr("checked");
      $("#AuthNameI").removeAttr("disabled");
      $("#AuthNameI").text(user.NtUsername_utf);
    }
  }
  if(user.AuthType_u32 == 4){
    if(user.RadiusUsername_utf.toString()==""){
      $("#AuthNameC").removeAttr("checked");
      $("#AuthNameI").attr("disabled","true");
    }
    else{
      $("#AuthNameC").attr("checked");
      $("#AuthNameI").removeAttr("disabled");
      $("#AuthNameI").text(user.RadiusUsername_utf);
    }
  }
  if(user.AuthType_u32 == 3){
    if(user.CommonName_utf.toString() == ""){
      $("#CN_C").removeAttr("checked");
      $("#CNval").attr("disabled", "true");
    }
    else{
      $("#CN_C").attr("checked", "true");
      $("#CNval").removeAttr("disabled");
    }
    if(toHex(atob(user.Serial_bin.toString())).toUpperCase() == ""){
      $("#SN_C").removeAttr("checked");
      $("#SNval").attr("disabled", "true");
    }
    else{
      $("#SN_C").attr("checked", "true");
      $("#SNval").removeAttr("disabled");
    }
    $("#CNval").val(user.CommonName_utf);
    $("#SNval").val(toHex(atob(user.Serial_bin.toString())).toUpperCase());
    console.log(user.Serial_bin);
  }
  if(user.UsePolicy_bool == true){
    $("#Policy").attr("checked", "true");
    $("#SECPOL").removeAttr("disabled");
  }
  else{
    $("#Policy").removeAttr("checked");
    $("#SECPOL").attr("disabled", "true");
  }
  $("#PasswdC").removeAttr("checked");
  $("#passwd").attr("disabled","true");
  $("#confirm").attr("disabled","true");
  switch(user.AuthType_u32){
    case 0: $("#AnonC").attr("checked","true"); $('#TYPESER').val(0); break;
    case 1: $("#PasswdC").attr("checked","true"); $("#passwd").removeAttr("disabled"); $("#confirm").removeAttr("disabled"); $('#TYPESER').val(1); break;
    case 2: $("#CertC").attr("checked","true"); $("#CertificateTextarea").removeAttr("disabled"); $("#CERTBTN").removeAttr("disabled"); $('#TYPESER').val(2); break;
    case 3: $("#SignedCertC").attr("checked","true"); $("#CN_C").removeAttr("disabled"); $("#SN_C").removeAttr("disabled"); $('#TYPESER').val(3); break;
    case 4: $("#RADIUSC").attr("checked","true"); $("#AuthNameC").removeAttr("disabled"); $('#TYPESER').val(4); break;
    case 5: $("#NTC").attr("checked","true"); $("#AuthNameC").removeAttr("disabled"); $('#TYPESER').val(5); break;
  }

}

export async function ClearUser(): Promise<void>
{
  $("#dateM").val('');
  $("#dateD").val('');
  $("#dateY").val('');
  $("#dateCheckBox").removeAttr("checked");
  $("#USERNAME").val('');
  $("#FULLNAME").val('');
  $("#NOTE").val('');
  $("#GROUPNAME").val('');
  $("#CNval").val('');
  $("#SNval").val('');
  $("#USER_C").val('');
  $("#AuthNameI").val('');
  $("#CertificateTextarea").val('');
  $("#passwd").val('');
  $("#confirm").val('');
  $('#U_BTN').find('button').attr("disabled", "true");
  $("#CN_C").removeAttr("checked");
  $("#SN_C").removeAttr("checked");
  $("#Policy").removeAttr("checked");
  $("#CN_C").attr("disabled", "true");
  $("#SN_C").attr("disabled", "true");
  $("#SNval").attr("disabled", "true");
  $("#CNval").attr("disabled", "true");
  $("#AuthNameI").attr("disabled","true");
  $("#SECPOL").attr("disabled", "true");
  $("#PasswdC").attr("checked");
  $("#passwd").removeAttr("disabled");
  $("#confirm").removeAttr("disabled");
  $("#AnonC").removeAttr("checked");
  $("#CertC").removeAttr("checked");
  $("#SignedCertC").removeAttr("checked");
  $("#RADIUSC").removeAttr("checked");
  $("#NTC").removeAttr("checked");
}

export async function SaveUser(queryString: string, type: number, name: string, fname: string, note: string, gname: string, date: Date, authname: string, cert: string, cn: string, sn: string, password: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  var encodeCert = new TextEncoder();
  var cer_bin = encodeCert.encode(cert);
  var bytes = new Uint8Array(Math.ceil(sn.length / 2));
  for (var i = 0; i < bytes.length; i++) bytes[i] = parseInt(sn.substr(i * 2, 2), 16);
  let rname: string = "";
  let nname: string = "";

  if(type == 4){
    rname = authname;
  }
  else if(type == 5){
    nname = authname;
  }

  if($("#dateCheckBox").is(":checked")){}
  else
  {date.setTime(0);}

  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: name,
      Realname_utf: fname,
      Note_utf: note,
      GroupName_str: gname,
      ExpireTime_dt: date,
      AuthType_u32: type,
      Auth_Password_str: password,
      UserX_bin: cer_bin,
      Serial_bin: bytes,
      CommonName_utf: cn,
      RadiusUsername_utf: rname,
      NtUsername_utf: nname,

    });
  try{
      await api.SetUser(userItem);
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function CreateUser(queryString: string, user: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let datezero = new Date();
  datezero.setTime(0);
  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: user,
      AuthType_u32: 1,
      Auth_Password_str: "defaultpassword",
      ExpireTime_dt: datezero,
    });

  try{
      await api.CreateUser(userItem);
  }
  catch (ex)
  {
      alert(ex);
  }
}

export async function UserInfo(queryString: string, user: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let li: JQuery<HTMLElement> = $("#userInfoT");
  li.empty();
  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: user,
    });
  let u = await api.GetUser(userItem);
  li.append("<tr><th scope=\"row\">User Name</th><td>" + u.Name_str + "</td></tr>");
  li.append("<tr><th scope=\"row\">Created on</th><td>" + u.CreatedTime_dt + "</td></tr>");
  li.append("<tr><th scope=\"row\">Udated on</th><td>" + u.UpdatedTime_dt + "</td></tr>");
  li.append("<tr><th scope=\"row\">Outgoing Unicast Packets</th><td>" + u["Send.UnicastCount_u64"] + " packets</td></tr>");
  li.append("<tr><th scope=\"row\">Outgoing Unicast Total Size</th><td>" + u["Send.UnicastBytes_u64"] + " bytes</td></tr>");
  li.append("<tr><th scope=\"row\">Outgoing Broadcast Packets</th><td>" + u["Send.BroadcastCount_u64"] + " packets</td></tr>");
  li.append("<tr><th scope=\"row\">Outgoing Broadcast Total Size</th><td>" + u["Send.BroadcastBytes_u64"] + " bytes</td></tr>");
  li.append("<tr><th scope=\"row\">Incoming Unicast Packets</th><td>" + u["Recv.UnicastCount_u64"] + " packets</td></tr>");
  li.append("<tr><th scope=\"row\">Incoming Unicast Total Size</th><td>" + u["Recv.UnicastBytes_u64"] + " bytes</td></tr>");
  li.append("<tr><th scope=\"row\">Incoming Broadcast Packets</th><td>" + u["Recv.BroadcastCount_u64"] + " packets</td></tr>");
  li.append("<tr><th scope=\"row\">Incoming Broadcast Total Size</th><td>" + u["Recv.BroadcastBytes_u64"] +" bytes</td></tr>");
  li.append("<tr><th scope=\"row\">Number of Logins</th><td>" + u.NumLogin_u32 + "</td></tr>");

}

export async function DelUser(queryString: string, user: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: user,
    });
  try {
    await api.DeleteUser(userItem);
    ListUsers(queryString);
  } catch (ex) {
    alert(ex);
  }
}

export async function CertUser(queryString: string, user: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: user,
    });
  let u = await api.GetUser(userItem);
  $("#CertificateTextarea").val("-----BEGIN CERTIFICATE-----\n" + u.UserX_bin.toString() + "\n-----END CERTIFICATE-----");
}

export async function PolicyONOFF(queryString: string, username: string): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: username,
    });
  let user = await api.GetUser(userItem);

  if($("#Policy").is(":checked")){
    user.UsePolicy_bool = true;
  }
  else{
    user.UsePolicy_bool = false;
  }

  await api.SetUser(user);
}

export async function UserPolicyRules(queryString: string, username: string): Promise <void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  $("#policyTable").empty();
  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: username,
    });
  let user = await api.GetUser(userItem);
  $("#usernameP").empty();
  $("#usernameP").append(user.Name_str);
  Object.keys(user).forEach(item =>{
    if(item.substring(0,7) == "policy:"){
      $("#policyTable").append("<tr><th scope=\"row\">" + item.substring(7) + "</th><td><input class=\"form-control\" type=\"text\" id=\"" + item.substring(7) + "\"></td></tr>");
      $("#"+item.substring(7)).val((<any>user)[item]);
    }
  });
}

export async function SetPolicy(queryString: string, username: string): Promise <void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);

  let userItem: VPN.VpnRpcSetUser = new VPN.VpnRpcSetUser(
    {
      HubName_str: hubNameInput,
      Name_str: username,
    });
  let user = await api.GetUser(userItem);

  Object.keys(user).forEach(item =>{
    if(item.substring(0,7) == "policy:"){
      ((<any>user)[item]) = $("#"+item.substring(7)).val();
    }
  });
  await api.SetUser(user);
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
  EnumAccessLists(queryString);
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
    al.empty();
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
      al.append("<tr><th scope=\"row\"><button class=\"btn btn-primary btn-sm\" type=\"button\" onclick=\"$('#RN').empty(); $('#RN').val("+ value.Id_u32 +"); $('#ERBTN').removeAttr('disabled'); $('#DRBTN').removeAttr('disabled')\">" + value.Id_u32 + "</button></th><td>" + value.Priority_u32 + "</td><td>" + action + "</td><td>" + value.IpAddress_ip + subnet + "</td></tr>");
      p = value.Priority_u32;
      c = value.Id_u32;
    });
    $("#PRIORITYL").empty();
    $("#PRIORITYL").val(p+100);
    $("#RNL").empty();
    $("#RNL").val(c+1);
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
  let listel = alist.ACList[id-1];
  $("#I_NETMASK").empty();
  if(listel.Masked_bool == true){
    $("#CHECKNM").empty();
    $("#CHECKNM").text('true');
    $("#CHECKNM_C").append("<input type=\"checkbox\" class=\"form-check-input\" id=\"CNETM\" onclick=\"$('#CHECKNM').empty(); $('#CHECKNM').text('false')\" checked>");
    $("#I_NETMASK").append("<input type=\"text\" class=\"form-control\" id=\"NETMASK\">");
  }
  else {
    $("#CHECKNM").empty();
    $("#CHECKNM").text('false');
    $("#CHECKNM_C").append("<input type=\"checkbox\" class=\"form-check-input\" id=\"CNETM\" onclick=\"document.getElementById('NETMASK').removeAttribute('disabled'); $('#CHECKNM').empty(); $('#CHECKNM').text('true') \">");
    $("#I_NETMASK").append("<input type=\"text\" class=\"form-control\" id=\"NETMASK\" disabled>");
  }
  if(listel.Deny_bool == true){
    $("#BOOLD").empty();
    $("#BOOLD").text('true');
    $("#B_A").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"permit\" onclick=\"$('#BOOLD').empty(); $('#BOOLD').text('false')\">");
    $("#B_D").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"deny\" checked>");
  }
  else{
    $("#BOOLD").empty();
    $("#BOOLD").text('false');
    $("#B_A").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"permit\" checked>");
    $("#B_D").append("<input class=\"form-check-input\" type=\"radio\" name=\"d\" id=\"deny\" onclick=\"$('#BOOLD').empty(); $('#BOOLD').text('true')\">");
  }

  $("#PRIORITY").empty();
  $("#PRIORITY").val(listel.Priority_u32);
  $("#NETMASK").empty();
  $("#NETMASK").val(listel.SubnetMask_ip);
  $("#IPADDR").empty();
  $("#IPADDR").val(listel.IpAddress_ip);
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

export async function AddAc(queryString: string, id: number, prio: number): Promise<void>
{
  let hubNameInput = queryString;
  if (hubNameInput.length >= 1 && hubNameInput.charAt(0) == "?") hubNameInput = hubNameInput.substring(1);
  let eAcc: VPN.VpnRpcAcList = new VPN.VpnRpcAcList(
    {
      HubName_str: hubNameInput,
    });
  let alist = await api.GetAcList(eAcc);

  let set = [
    {"Id_u32": id, "Priority_u32": prio, "Deny_bool": false, "Masked_bool": false, "IpAddress_ip": "0.0.0.0","SubnetMask_ip": "0.0.0.0"}
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
  let msgParam: VPN.VpnRpcMsg = new VPN.VpnRpcMsg(
    {
      HubName_str: hubNameInput,
      Msg_bin: arr,
    });
  await api.SetHubMsg(msgParam);
}

export async function IPsecGet(): Promise<void>
{
  let ipseconf = await api.GetIPsecServices();
  let hubslist = await  api.EnumHub();
  $("#VHUB_L2TP").empty();
  hubslist.HubList.forEach(hub =>
  {
      $("#VHUB_L2TP").append("<option value=\"" + hub.HubName_str + "\">" + hub.HubName_str  + "</option>");
  });
  //
    $("select#VHUB_L2TP").val(ipseconf.L2TP_DefaultHub_str);
  //
  if(ipseconf.L2TP_Raw_bool == true){
    $("#L2TP_RAW_C").attr("checked", "true");
  }
  else{
    $("#L2TP_RAW_C").removeAttr("checked");
  }
  //
  if(ipseconf.L2TP_IPsec_bool == true){
    $("#L2TP_C").attr("checked", "true");
    $("#preSharedKey").removeAttr("disabled");
  }
  else{
    $("#L2TP_C").removeAttr("checked");
    $("#preSharedKey").attr("disabled","ture");
  }
  //
  if(ipseconf.EtherIP_IPsec_bool == true){
    $("#ETHERIP_C").attr("checked", "true");
    $("#ETHERIP_BTN").removeAttr("disabled");
    $("#preSharedKey").removeAttr("disabled");
  }
  else{
    $("#ETHERIP_C").removeAttr("checked");
    $("#ETHERIP_BTN").attr("disabled", "true");
    $("#preSharedKey").attr("disabled","ture");
  }
  //
  $("#preSharedKey").val(ipseconf.IPsec_Secret_str);

}

export async function IPsecSet(secret: string, defhub: string): Promise<void>
{

  let ipseconf: VPN.VpnIPsecServices = new VPN.VpnIPsecServices(
    {
      L2TP_Raw_bool: $("#L2TP_RAW_C").is(":checked"),
      L2TP_IPsec_bool: $("#L2TP_C").is(":checked"),
      EtherIP_IPsec_bool: $("#ETHERIP_C").is(":checked"),
      IPsec_Secret_str: secret,
      L2TP_DefaultHub_str: defhub,
    });
  await api.SetIPsecServices(ipseconf);
}

export async function ipsecphGet(): Promise<void>
{
  let el: JQuery<HTMLElement> = $("#IP1ID");
  el.empty();
  let list = await api.EnumEtherIpId();
  list.Settings.forEach(id => {
    el.append("<tr><th scope=\"row\"><button type=\"button\" class=\"btn btn-link\" onclick=\"$('#ISAKMP').val('" + id.Id_str + "'); $('#BTN_D').removeAttr('disabled'); $('#BTN_E').removeAttr('disabled')\">" + id.Id_str + "</button></th><td>" + id.HubName_str + "</td><td>" + id.UserName_str + "</td></tr>");
  });
  ipsecphHub();
}

export async function ipsecphSetGet(inid: string): Promise<void>
{
  let id: VPN.VpnEtherIpId = new VPN.VpnEtherIpId(
    {
      Id_str: inid,
    });
  let ipid = await api.GetEtherIpId(id);
  $("#ISAKMP").val(ipid.Id_str);
  $("select#VHUB_ISAKMP").val(ipid.HubName_str);
  $("#UNAME_ISAKMP").val(ipid.UserName_str);
  $("#PASSWD_ISAKMP").val(ipid.Password_str);

}

export async function ipsecphClean(): Promise<void>
{
  $("#ISAKMP").val('');
  $("#UNAME_ISAKMP").val('');
  $("#PASSWD_ISAKMP").val('');
}

export async function ipsecphHub(): Promise<void>
{
  let hubslist = await  api.EnumHub();
  $("#VHUB_ISAKMP").empty();
  hubslist.HubList.forEach(hub =>
  {
      $("#VHUB_ISAKMP").append("<option value=\"" + hub.HubName_str + "\">" + hub.HubName_str  + "</option>");
  });
}
export async function ipsecphN(): Promise<void>
{
  $("#SAVEBTNISA").empty();
  $("#SAVEBTNISA").append("<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" data-toggle=\"modal\" data-target=\"#ipsecdetailmodal\" onclick=\"JS.ipsecphAdd($('#ISAKMP').val(), $('select#VHUB_ISAKMP').val(), $('#UNAME_ISAKMP').val(), $('#PASSWD_ISAKMP').val()); JS.ipsecphGet()\">OK</button>");
}

export async function ipsecphE(id: string): Promise<void>
{
  $("#SAVEBTNISA").empty();
  $("#SAVEBTNISA").append("<input type=\"text\" id=\"ID_OLD\" style=\"display: none;\">");
  $("#ID_OLD").val(id);
  $("#SAVEBTNISA").append("<button type=\"button\" class=\"btn btn-primary\" data-dismiss=\"modal\" data-toggle=\"modal\" data-target=\"#ipsecdetailmodal\" onclick=\"JS.ipsecphSet($('#ID_OLD').val(), $('#ISAKMP').val(), $('select#VHUB_ISAKMP').val(), $('#UNAME_ISAKMP').val(), $('#PASSWD_ISAKMP').val()); JS.ipsecphGet()\">OK</button>");
}
export async function ipsecphSet(inin: string, inid: string, hub: string, uname: string, password: string): Promise<void>
{
  ipsecphDel(inin);
  let id: VPN.VpnEtherIpId = new VPN.VpnEtherIpId(
    {
      Id_str: inid,
      HubName_str: hub,
      UserName_str: uname,
      Password_str: password,
    });
  await api.AddEtherIpId(id);


}


export async function ipsecphAdd(inid: string, hub: string, uname: string, password: string): Promise<void>
{
  let id: VPN.VpnEtherIpId = new VPN.VpnEtherIpId(
    {
      Id_str: inid,
      HubName_str: hub,
      UserName_str: uname,
      Password_str: password,
    });
  await api.AddEtherIpId(id);
}

export async function ipsecphDel(inid: string): Promise<void>
{
  let inidc: VPN.VpnEtherIpId = new VPN.VpnEtherIpId(
    {
      Id_str: inid,
    });
    try{
        await api.DeleteEtherIpId(inidc);
        $("#BTN_D").attr("disabled","true");
        $("#BTN_E").attr("disabled","true");
    }
    catch (ex)
    {
        alert(ex);
    }


}

export async function getOVPN(): Promise<void>
{
  let settings = await api.GetOpenVpnSstpConfig();
  if(settings.EnableOpenVPN_bool == true){
    $("#OVPN_C").attr("checked", "true");
    $("#UDPports").removeAttr("disabled");
    $("#SampleBTN").removeAttr("disabled");
    $("#ResDefOVPN").removeAttr("disabled");
  }
  else{
    $("#OVPN_C").removeAttr("checked");
    $("#UDPports").attr("disabled","true");
    $("#SampleBTN").attr("disabled","true");
    $("#ResDefOVPN").attr("disabled","true");
  }
$("#UDPports").val(settings.OpenVPNPortList_str);

if(settings.EnableSSTP_bool == true){
  $("#MSSSTP").attr("checked", "true");
}
else{
  $("#MSSSTP").removeAttr("checked");
}
}

export async function setOVPN(ports: string): Promise<void>
{
  var ovpn;
  var mssstp;
  if($("#OVPN_C").is(":checked")){
    ovpn = true;
  }
  else{
    ovpn = false;
  }

  if($("#MSSSTP").is(":checked")){
    mssstp = true;
  }
  else{
    mssstp = false;
  }

  let conf: VPN.VpnOpenVpnSstpConfig = new VPN.VpnOpenVpnSstpConfig(
    {
      EnableOpenVPN_bool: ovpn,
      OpenVPNPortList_str: ports,
      EnableSSTP_bool: mssstp,
    });
  await api.SetOpenVpnSstpConfig(conf);
}

function downloadBlob(blob: Blob, name = 'file.txt') {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");

  // Set link's href to point to the Blob URL
  link.href = blobUrl;
  link.download = name;

  // Append link to the body
  document.body.appendChild(link);

  // Dispatch click event on the link
  // This is necessary as link.click() does not work on the latest firefox
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
  );

  // Remove link from body
  document.body.removeChild(link);
}

export async function ConfigFile(): Promise<void>
{
  let conf = await api.MakeOpenVpnConfigFile();

  const b64toBlob = (b64Data: string, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
  const blob = b64toBlob(conf.Buffer_bin.toString(), "application/zip");
  downloadBlob(blob, 'config.zip');
}

export async function AzureGet(): Promise<void>
{
  let azstat = await api.GetAzureStatus();
  let dns = await api.GetDDnsClientStatus();
  $("#azureDyn").empty();
  if (azstat.IsEnabled_bool == true){
    $("#AzureON").attr("checked", "true");
    $("#AzureOFF").removeAttr("checked");
    $("#azuredyn").attr("style","display:");
    $("#azureDyn").append(dns.CurrentHostName_str + ".vpnazure.net");
  }
  else{
    $("#AzureOFF").attr("checked", "true");
    $("#AzureON").removeAttr("checked");
    $("#azuredyn").attr("style","display: none;");
  }
  $("#azureS").empty();
  if(azstat.IsConnected_bool == true){
    $("#azureS").append("Connected");
  }
  else{
    $("#azureS").append("Not Connected");
  }
  setTimeout(() => {  AzureGet();}, 5000);
}

export async function AzureSet(bol: boolean): Promise<void>
{

  let az: VPN.VpnRpcAzureStatus = new VPN.VpnRpcAzureStatus(
    {
      IsEnabled_bool: bol,
    });
  await api.SetAzureStatus(az);
  AzureGet();
}
