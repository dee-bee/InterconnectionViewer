String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var outputJSONStr = "" 
outputObj = {}
doxPrefix = ""

function doIt(doxUrl, t_doxPrefix){
    doxPrefix = t_doxPrefix
    getDoxygenFilePaths(doxUrl)

    outputJSONStr = "" 
    outputObj = {}

    importString = importString.replace(/[.]java:[ ]*import[ ]*/g, " ") 
    importString = importString.replace(/;/g, "") 
    importString = importString.replace(/\//g, ".") 

    t1 = importString.split("\n")
    importStringArr = []

    for(tally = 0; tally < t1.length; tally++){
        importStringArr.push(t1[tally].split(" "))
    }

    
    for(tally = 0; tally < importStringArr.length; tally++){
        /*"name": "src/actions.c",
        "size": 7000,
        "imports": [
          "src/actions.c",
          "src/lcd.c",
          "src/timer.c",
          "src/register.c",
          "src/x48_x11.c",
          "src/serial.c"
        ],
        "fromTo": [
          {
            "sourceFile": "src/actions.c",
            "sourceFuncUrl": "http://ncr.danielbermender.com/x48-0.4.1/documentation/html/actions_8c.html#a01568dbc532f8716cfd3e4d0302de748",
            "sourceFuncName": "do_return_interupt",
            "destinationFile": "src/actions.c",
            "destinationFuncUrl": "http://ncr.danielbermender.com/x48-0.4.1/documentation/html/actions_8c.html#a48a5583ea8f2767c9a40055fbce8d6b2",
            "destinationFuncName": "pop_return_addr"
          }
        ],
        "url": "http://ncr.danielbermender.com/x48-0.4.1/documentation/html/actions_8c.html"
        */

        sourceName = importStringArr[tally][0]
        destName = importStringArr[tally][1]
        
        if(outputObj[sourceName] == undefined){
            addNewNode(sourceName)
        }

        if(outputObj[destName] == undefined){
            addNewNode(destName)
        }


        var itemObj = outputObj[sourceName]

        itemObj.imports[destName] = ""

        var fromToObj = {}
        fromToObj.sourceFile = sourceName
        fromToObj.sourceFuncUrl = "na"
        fromToObj.sourceFuncName = "na"
        fromToObj.destinationFile = destName
        fromToObj.destinationFuncUrl = "na"
        fromToObj.destinationFuncName = "na"

        itemObj.fromTo.push(fromToObj)
    }
}

function outputJSON(){
    //Change import keys to array, and remove keys on root obj
    var outputObjKeys = Object.keys(outputObj)
    var finalOutputArr = []
    for(tally = 0; tally < outputObjKeys.length; tally++){
        importKeys = Object.keys(
                    outputObj[outputObjKeys[tally]].imports)
        outputObj[outputObjKeys[tally]].imports = importKeys

        finalOutputArr.push(outputObj[outputObjKeys[tally]])
    }

    outputJSONStr += JSON.stringify(finalOutputArr, null, 4)
    console.log(outputJSONStr)
}

function addNewNode(name){
    var itemObj = {}
    itemObj.name = name
    itemObj.size = 7000

    var itemObjImports = []
    itemObj.imports = itemObjImports

    var itemObjToFrom = []
    itemObj.fromTo = itemObjToFrom

    itemObj.url = ""
    if(doxListObj[sourceName] != null){
        itemObj.url = doxPrefix + doxListObj[name]
        console.log(itemObj.url)
    }
    outputObj[name] = itemObj   
}


currentPath = []
doxListObj = {}

function getDoxygenFilePaths(doxUrl){
  $.ajax({
     async: false,
     type: 'GET',
     url: doxUrl,
     success: function(data) {
        html = (new window.DOMParser()).parseFromString(data, "text/html")
        trRows = $(html).find("tr[id^=row_")

        for(tally=0; tally< trRows.length; tally++){
            rowName = $(trRows[tally]).find(">.entry>a.el").text()
            url = $(trRows[tally]).find(">.entry>a.el").attr("href")

            rowArr = trRows[tally].id.split("_")
            rowArr = rowArr.reverse()
            rowArr.pop()
            rowArr.reverse()

            if(rowArr[rowArr.length - 1] == ""){rowArr.pop()}

            while(currentPath.length >= rowArr.length)
                currentPath.pop()

            currentPath.push(rowName)

            doxListObj[currentPath.toString().replace(/[,]/g,".")] = url
        }
     }
  });
}

function patchToLatestFormat(){
    $.get("diagrams/Ipsidy-IdACS-imports-view5.json", function(data){
        for(tally=0; tally< data.length; tally++){
            if(data[tally].x != undefined){
                flareImportJson[tally].x = data[tally].x
            }

            if(data[tally].y != undefined){
                flareImportJson[tally].y = data[tally].y
            }

            if(data[tally].fixed != undefined){
                flareImportJson[tally].fixed = data[tally].fixed
            }
        }

        parseJson(flareImportJson)
    }, "json")
}

//idacs/WebLib/src$ grep -rP "import[ ]+(static[ ]*)?com.idgs" *
//idacs/WebLib/src$ grep -rP "import[ ]+(static[ ]*)?com.idacs." *
//grep -rP "import[ ]+(static[ ]*)?com.idacs." * | xclip -i -selection clipboard

importStringIDACS = `com/idacs/weblib/InitRoutine.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/InitRoutine.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/ServerBackendRoutine.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/ServerBackendRoutine.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/EncryptionRoutine.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/YsUtils.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/YsUtils.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/IdCompleteRestCalls.java:import static com.idacs.weblib.Constants.LOGGER;
com/idacs/weblib/IdCompleteRestCalls.java:import static com.idacs.weblib.Constants.TXT_ERR;
com/idacs/weblib/UpdateRoutine.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/DBr.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/DBr.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/Common.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/Common.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/AsyncEmailMessage.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/ZZZTemplate.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/ZZZTemplate.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/YsResultSet.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/BrivoAdmCreds.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/DigiSign.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/DigiSign.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/IdCompleteAdminCreds.java:import static com.idacs.weblib.Constants.LOGGER;
com/idacs/weblib/SoapWrapper.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/ServiceUtils.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/ServiceUtils.java:import static com.idacs.weblib.DBr.db;
com/idacs/weblib/DbOperations.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/WebRoutine.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/AdminLogic.java:import static com.idacs.weblib.Constants.*;
com/idacs/weblib/UserRights.java:import static com.idacs.weblib.Constants.*;
com/qrcodegen/QrCodeGeneratorWorker.java:import static com.idacs.weblib.Constants.*;
com/idacs_nt/service/CleanUp.java:import static com.idacs.weblib.Constants.LOGGER;
com/idacs_nt/service/CleanUp.java:import static com.idacs.weblib.DBr.db;
com/idacs_nt/service/CleanUp.java:import com.idacs.weblib.YsResultSet;
com/idgs/testmethods/Tests.java:import com.idacs.weblib.ServiceUtils;
com/idgs/testmethods/Tests.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.AsyncEmailMessage;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.Common;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Common.getApiKeyByDescription;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.DBr.db;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.RequestBody;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.RIGHTBITMASK;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.SITEADMINMASK;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.SUPERADMINMASK;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.USER_DOCUMENTNO;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.USER_UINIDCOMPLETE;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.Constants.VISITORMASK;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.DBr;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.WebCallParameters;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.WebRoutine;
com/idgs/admin/AuthRequestsRoutine.java:import com.idacs.weblib.YsUtils;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idacs.weblib.AuthParameters.authUrlPrefix;
com/idgs/admin/AuthWrapper.java:import com.idacs.weblib.Common;
com/idgs/admin/AuthWrapper.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/AuthWrapper.java:import com.idacs.weblib.*;
com/idgs/admin/AuthWrapper.java:import static com.idacs.weblib.AuthParameters.authUrlPrefix;
com/idgs/admin/BrivoWrapper.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/BrivoWrapper.java:import com.idacs.weblib.DBr;
com/idgs/admin/BrivoWrapper.java:import com.idacs.weblib.ServiceUtils;
com/idgs/admin/BrivoWrapper.java:import com.idacs.weblib.WebCallParameters;
com/idgs/admin/BrivoWrapper.java:import com.idacs.weblib.WebRoutine;
com/idgs/admin/BrivoWrapper.java:import com.idacs.weblib.YsUtils;
com/idgs/admin/BrivoRoutine.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/BrivoRoutine.java:import com.idacs.weblib.DBr;
com/idgs/admin/BrivoRoutine.java:import com.idacs.weblib.RequestBody;
com/idgs/admin/BrivoRoutine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/admin/BrivoRoutine.java:import com.idacs.weblib.WebCallParameters;
com/idgs/admin/BrivoRoutine.java:import com.idacs.weblib.WebRoutine;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.RequestBody;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.Common;
com/idgs/admin/SiteLogic.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.DBr;
com/idgs/admin/SiteLogic.java:import static com.idacs.weblib.DBr.db;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.ServiceUtils;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.YsResultSet;
com/idgs/admin/SiteLogic.java:import static com.idacs.weblib.Constants.SITE_NAME;
com/idgs/admin/SiteLogic.java:import static com.idacs.weblib.Constants.SUBSITES;
com/idgs/admin/SiteLogic.java:import static com.idacs.weblib.Constants.VISITORMASK;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.UserRights;
com/idgs/admin/SiteLogic.java:import com.idacs.weblib.YsUtils;
com/idgs/admin/SiteLogic.java:import static com.idacs.weblib.AuthParameters.authUrlPrefix;
com/idgs/admin/UserRoutine.java:import com.idacs.weblib.Common;
com/idgs/admin/UserRoutine.java:import static com.idacs.weblib.Constants.*;
com/idgs/admin/UserRoutine.java:import com.idacs.weblib.DBr;
com/idgs/admin/UserRoutine.java:import com.idacs.weblib.RequestBody;
com/idgs/admin/UserRoutine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/qr/QRCode.java:import static com.idacs.weblib.Constants.*;
com/idgs/dbobjects/AccessPointGroup.java:import static com.idacs.weblib.Constants.ENTITY_ACCESSPOINTGROUP;
com/idgs/dbobjects/Attribute.java:import com.idacs.weblib.EncryptionRoutine;
com/idgs/dbobjects/SecurityGroup.java:import static com.idacs.weblib.Constants.ENTITY_SECURITYGROUP;
com/idgs/dbobjects/BeaconGroup.java:import static com.idacs.weblib.Constants.ENTITY_BEACONGROUP;
com/idgs/dbobjects/Site.java:import static com.idacs.weblib.Constants.SET_ANYSET;
com/idgs/dbobjects/Site.java:import com.idacs.weblib.DBr;
com/idgs/dbobjects/CustomerCategory.java:import static com.idacs.weblib.Constants.SET_ANYSET;
com/idgs/dbobjects/EntityRelation.java:import static com.idacs.weblib.Constants.*;
com/idgs/dbobjects/EntityRelation.java:import static com.idacs.weblib.DBr.db;
com/idgs/dbobjects/EntityRelation.java:import com.idacs.weblib.YsResultSet;
com/idgs/dbobjects/Transaction.java:import static com.idacs.weblib.Constants.*;
com/idgs/dbobjects/Transaction.java:import static com.idacs.weblib.DBr.db;
com/idgs/dbobjects/Transaction.java:import com.idacs.weblib.YsResultSet;
com/idgs/dbobjects/DbGroupEntity.java:import static com.idacs.weblib.Constants.*;
com/idgs/dbobjects/DbGroupEntity.java:import com.idacs.weblib.DBr;
com/idgs/dbobjects/DbGroupEntity.java:import static com.idacs.weblib.DBr.db;
com/idgs/dbobjects/DbGroupEntity.java:import com.idacs.weblib.YsResultSet;
com/idgs/dbobjects/User.java:import static com.idacs.weblib.Constants.SET_ANYSET;
com/idgs/dbobjects/EntityRecordEntry.java:import static com.idacs.weblib.Constants.*;
com/idgs/dbobjects/EntityRecordEntry.java:import static com.idacs.weblib.DBr.db;
com/idgs/dbobjects/DbObject.java:import static com.idacs.weblib.Constants.*;
com/idgs/dbobjects/DbObject.java:import static com.idacs.weblib.DBr.db;
com/idgs/dbobjects/DbObject.java:import com.idacs.weblib.YsResultSet;
com/idgs/dbobjects/DbObject.java:import com.idacs.weblib.YsUtils;
com/idgs/dbobjects/UserGroup.java:import static com.idacs.weblib.Constants.ENTITY_USERGROUP;
com/idgs/binarytree/BinaryTree.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/IDCompleteOps27.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/IDCompleteOps27.java:import com.idacs.weblib.DBr;
com/idgs/mt2/IDCompleteOps27.java:import com.idacs.weblib.SoapWrapper;
com/idgs/mt2/IDCompleteOps27.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/IDCompleteOps27.java:import com.idacs.weblib.YsUtils;
com/idgs/mt2/AuthThread.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/AuthThread.java:import com.idacs.weblib.DBr;
com/idgs/mt2/AuthThread.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/AuthThread.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/AuthThread.java:import com.idacs.weblib.YsResultSet;
com/idgs/mt2/AuthThread.java:import com.idacs.weblib.YsUtils;
com/idgs/mt2/ListsNT.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/ListsNT.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/ListsNT.java:import com.idacs.weblib.YsResultSet;
com/idgs/mt2/ListsNT.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/ListsNT.java:import com.idacs.weblib.*;
com/idgs/mt2/SiteType4Routine.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/SiteType4Routine.java:import com.idacs.weblib.DBr;
com/idgs/mt2/SiteType4Routine.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/SiteType4Routine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/UnlockRoutineMT2.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/UnlockRoutineMT2.java:import com.idacs.weblib.DBr;
com/idgs/mt2/UnlockRoutineMT2.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/UnlockRoutineMT2.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/UnlockRoutineMT2.java:import static com.idacs.weblib.YsUtils.getTblData;
com/idgs/mt2/CommonAdminRoutine.java:import static com.idacs.weblib.Common.getApiKeyByDescription;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/CommonAdminRoutine.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.DBr;
com/idgs/mt2/CommonAdminRoutine.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.IdCompleteRestCalls;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.VarVerification;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.YsResultSet;
com/idgs/mt2/CommonAdminRoutine.java:import com.idacs.weblib.UserRights;
com/idgs/mt2/ApplicationID.java:import static com.idacs.weblib.Constants.LOGGER;
com/idgs/mt2/ApplicationID.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/BulkUserUploadWorker.java:import com.idacs.weblib.DBr;
com/idgs/mt2/BulkUserUploadWorker.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/BulkUserUploadWorker.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/BulkUserUploadWorker.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idacs.weblib.DBr;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idacs.weblib.VarVerification;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idacs.weblib.YsResultSet;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import static com.idacs.weblib.Constants.TS_TRANSACTIONSTATUSID;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idacs.weblib.YsUtils;
com/idgs/mt2/v26routine/BrivoMT.java:import com.idacs.weblib.BrivoAdmCreds;
com/idgs/mt2/v26routine/BrivoMT.java:import static com.idacs.weblib.BrivoAdmCreds.apiKey;
com/idgs/mt2/v26routine/BrivoMT.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/v26routine/BrivoMT.java:import com.idacs.weblib.DBr;
com/idgs/mt2/v26routine/BrivoMT.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/v26routine/BrivoMT.java:import com.idacs.weblib.WebCallParameters;
com/idgs/mt2/v26routine/BrivoMT.java:import com.idacs.weblib.WebRoutine;
com/idgs/mt2/v26routine/BrivoMT.java:import com.idacs.weblib.YsUtils;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.Common;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.Constants;
com/idgs/mt2/CommonRoutineMT2.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.DBr;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.VarVerification;
com/idgs/mt2/CommonRoutineMT2.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.YsResultSet;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.YsUtils;
com/idgs/mt2/CommonRoutineMT2.java:import com.idacs.weblib.*;
com/idgs/mt2/IdCompleteAdminCreds.java:import static com.idacs.weblib.Constants.LOGGER;
com/idgs/mt2/IdCompleteAdminCreds.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import com.idacs.weblib.DBr;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import com.idacs.weblib.YsResultSet;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import com.idacs.weblib.YsUtils;
com/idgs/mt2/RevokeRoutine.java:import static com.idacs.weblib.Constants.*;
com/idgs/mt2/RevokeRoutine.java:import com.idacs.weblib.DBr;
com/idgs/mt2/RevokeRoutine.java:import static com.idacs.weblib.DBr.db;
com/idgs/mt2/RevokeRoutine.java:import com.idacs.weblib.RequestBody;
com/idgs/mt2/RevokeRoutine.java:import com.idacs.weblib.ServiceUtils;
com/idgs/mt2/RevokeRoutine.java:import com.idacs.weblib.YsResultSet;`

importStringIDGS = `com/idacs/weblib/UpdateRoutine.java:import com.idgs.dbobjects.DbObject;
com/idacs/weblib/DBr.java:import com.idgs.admin.SiteLogic;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.DbGroupEntity;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.DbObject;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.EntityRelation;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.SecurityGroup;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.Site;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.Transaction;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.User;
com/idacs/weblib/DBr.java:import com.idgs.dbobjects.UserGroup;
com/idacs/weblib/DBr.java:import com.idgs.mt2.CommonRoutineMT2;
com/idacs/weblib/DBr.java:import com.idgs.binarytree.BinaryTree;
com/idacs/weblib/Common.java:import com.idgs.dbobjects.ApiKey;
com/idacs/weblib/Common.java:import com.idgs.dbobjects.LokPass;
com/idacs/weblib/UserRights.java:import com.idgs.admin.SiteLogic;
com/idacs/weblib/UserRights.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idacs/weblib/UserRights.java:import com.idgs.dbobjects.EntityRelation;
com/idacs/weblib/UserRights.java:import com.idgs.dbobjects.Site;
com/idacs/weblib/UserRights.java:import com.idgs.dbobjects.User;
com/idgs/testmethods/Tests.java:import com.idgs.dbobjects.User;
com/idgs/testmethods/Tests.java:import com.idgs.dbobjects.Transaction;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.EntityRelation;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.User;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.AccessPoint;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.Site;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.SecurityGroup;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.MixedGroup;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.Beacon;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.BeaconGroup;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.Transaction;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.UserGroup;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.TransactionStatus;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.mt2.CommonRoutineMT2;
com/idgs/admin/AuthRequestsRoutine.java:import com.idgs.mt2.IDCompleteOps27;
com/idgs/admin/AuthRequestsRoutine.java:import static com.idgs.admin.BrivoRoutine.createBrivoUser;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.v27routine.IdAcs27Routine;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.listroutine.ListUsersRoutine;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.CommonRoutineMT2;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.ListsNT;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.SiteType4Routine;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.CommonAdminRoutine;
com/idgs/admin/AuthWrapper.java:import com.idgs.mt2.RevokeRoutine;
com/idgs/admin/AuthWrapper.java:import com.idgs.dbobjects.DbGroupEntity;
com/idgs/admin/AuthWrapper.java:import com.idgs.dbobjects.Site;
com/idgs/admin/AuthWrapper.java:import com.idgs.dbobjects.User;
com/idgs/admin/BrivoWrapper.java:import com.idgs.dbobjects.Site;
com/idgs/admin/BrivoRoutine.java:import com.idgs.dbobjects.AccessPoint;
com/idgs/admin/BrivoRoutine.java:import com.idgs.dbobjects.AccessPointGroup;
com/idgs/admin/BrivoRoutine.java:import com.idgs.dbobjects.SecurityGroup;
com/idgs/admin/BrivoRoutine.java:import com.idgs.dbobjects.Site;
com/idgs/admin/BrivoRoutine.java:import com.idgs.dbobjects.User;
com/idgs/admin/BrivoRoutine.java:import com.idgs.dbobjects.UserGroup;
com/idgs/admin/BrivoRoutine.java:import com.idgs.mt2.CommonAdminRoutine;
com/idgs/admin/BrivoRoutine.java:import com.idgs.mt2.CommonRoutineMT2;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.AccessPointGroup;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.Beacon;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.EntityRelation;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.SecurityGroup;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.Site;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.User;
com/idgs/admin/SiteLogic.java:import com.idgs.dbobjects.UserGroup;
com/idgs/admin/SiteLogic.java:import com.idgs.mt2.CommonRoutineMT2;
com/idgs/admin/SiteLogic.java:import com.idgs.mt2.IDCompleteOps27;
com/idgs/admin/SiteLogic.java:import com.idgs.mt2.UnlockRoutineMT2;
com/idgs/admin/UserRoutine.java:import com.idgs.mt2.IDCompleteOps27;
com/idgs/admin/UserRoutine.java:import com.idgs.mt2.CommonRoutineMT2;
com/idgs/admin/UserRoutine.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idgs/admin/UserRoutine.java:import com.idgs.dbobjects.EntityRelation;
com/idgs/admin/UserRoutine.java:import com.idgs.dbobjects.Site;
com/idgs/admin/UserRoutine.java:import com.idgs.dbobjects.User;
com/idgs/mt2/AuthThread.java:import com.idgs.admin.BrivoRoutine;
com/idgs/mt2/AuthThread.java:import com.idgs.dbobjects.AccessPoint;
com/idgs/mt2/AuthThread.java:import com.idgs.dbobjects.LokPass;
com/idgs/mt2/AuthThread.java:import com.idgs.dbobjects.Transaction;
com/idgs/mt2/AuthThread.java:import com.idgs.dbobjects.User;
com/idgs/mt2/AuthThread.java:import com.idgs.dbobjects.userNDA;
com/idgs/mt2/SiteType4Routine.java:import com.idgs.dbobjects.CustomerCategory;
com/idgs/mt2/SiteType4Routine.java:import com.idgs.dbobjects.LokPassType;
com/idgs/mt2/SiteType4Routine.java:import com.idgs.dbobjects.Site;
com/idgs/mt2/UnlockRoutineMT2.java:import com.idgs.dbobjects.*;
com/idgs/mt2/UnlockRoutineMT2.java:import static com.idgs.mt2.CommonRoutineMT2.ndaRequired;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.admin.SiteLogic;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.AccessPoint;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.AccessPointGroup;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.Beacon;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.BeaconGroup;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.DbObject;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.EntityRelation;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.SecurityGroup;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.Site;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.Transaction;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.User;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.dbobjects.UserGroup;
com/idgs/mt2/CommonAdminRoutine.java:import com.idgs.mt2.v27routine.IdAcs27Routine;
com/idgs/mt2/BulkUserUploadWorker.java:import com.idgs.dbobjects.Transaction;
com/idgs/mt2/BulkUserUploadWorker.java:import com.idgs.admin.SiteLogic;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.EntityRelation;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.User;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.AccessPoint;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.Beacon;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.Transaction;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.TransactionStatus;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.mt2.IDCompleteOps27;
com/idgs/mt2/v27routine/IdAcs27Routine.java:import com.idgs.qr.QRCode;
com/idgs/mt2/v27routine/Transaction27Authorization.java:import com.idgs.dbobjects.Transaction;
com/idgs/mt2/v27routine/Transaction27Authorization.java:import com.idgs.mt2.IDCompleteOps27;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.User;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.Site;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.AccessPoint;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.MixedGroup;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.Transaction;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.EntityRelation;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.DbGroupEntity;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.Beacon;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.LokPassType;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.DbObject;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.userNDA;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.UserGroup;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.AccessPointGroup;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.EntityRecordEntry;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.dbobjects.LokPass;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.admin.UserRoutine;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.mt2.v26routine.BrivoMT;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.mt2.v27routine.IdAcs27Routine;
com/idgs/mt2/CommonRoutineMT2.java:import com.idgs.qr.QRCode;
com/idgs/mt2/CommonRoutineMT2.java:import static com.idgs.admin.BrivoRoutine.createBrivoUser;
com/idgs/mt2/listroutine/ListUsersRoutine.java:import com.idgs.dbobjects.User;
com/idgs/mt2/RevokeRoutine.java:import com.idgs.dbobjects.User;
`


//importString = importStringIDGS
importString = importStringIDACS


doIt("http://localhost/Link%20to%20DoxygenProjects/DoxOutput/IdACS/html/annotated.html", "")
outputJSON()