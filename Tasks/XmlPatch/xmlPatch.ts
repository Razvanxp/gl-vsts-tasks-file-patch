import path = require('path');
import fs = require('fs-extra');
import tl = require('vsts-task-lib/task');

import patch = require('./common/patch');
import patchProcess = require('./common/patchProcess');
import xmlPatcher = require('./xmlPatcher');

interface IPatch{
    op: string;
    path: string;
    value: any;
}

var targetPath = tl.getPathInput("XmlWorkingDir");
var patchContent = tl.getInput("JsonPatchContent");
var outputPatchedFile = tl.getBoolInput("OutputPatchFile");
var failIfNoPatchApplied = tl.getBoolInput("FailIfNoPatchApplied");
var skipErrors = tl.getBoolInput("SkipErrors");
var syntax = tl.getInput("SyntaxType");

var patterns: any = tl.getInput("XmlTargetFilters")

try {
    var namespaces: { [tag: string]: string } = syntax == "slick" ? 
        xmlPatcher.loadNamespaces(tl.getInput("Namespaces")) : 
        (namespaces ? JSON.parse(tl.getInput("Namespaces")) : {});

    var patches: patch.IPatch[] = syntax == "slick" ? 
    patchProcess.expandVariablesAndParseSlickPatch(patchContent) :
    patchProcess.expandVariablesAndParseJson(patchContent);

    patchProcess.apply(new xmlPatcher.XmlPatcher(patches, namespaces), targetPath, patterns, outputPatchedFile, failIfNoPatchApplied, skipErrors);

} catch (err) {
    console.error(String(err));
    tl.setResult(tl.TaskResult.Failed, String(err));
}