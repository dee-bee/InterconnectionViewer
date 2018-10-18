String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var outputJSONStr = "" 
outputObj = {}

function doIt(){
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

    outputObj[name] = itemObj   
}


importString = `com/idacs/weblib/UpdateRoutine.java:import com.idgs.dbobjects.DbObject;
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
com/idgs/mt2/listroutine/ListUsersRoutine.java:import com.idgs.dbobjects.User;
com/idgs/mt2/RevokeRoutine.java:import com.idgs.dbobjects.User;`
