const vscode = require("vscode");
const path = require("path");
const fs = require("fs");

function activate(context) {
  console.log("AI Code Fixer extension activated.");

  let disposable = vscode.commands.registerCommand("aiCodeFixer.debug", async function () {
    console.log("Command 'aiCodeFixer.debug' executed.");

    const panel = vscode.window.createWebviewPanel(
      "aiCodeFixerPanel",
      "AI Code Fixer",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "media"))]
      }
    );

    const htmlPath = path.join(context.extensionPath, "dist", "index.html");
    let html = fs.readFileSync(htmlPath, "utf8");

    const scriptUri = panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(context.extensionPath, "media", "bundle.js"))
    );
    html = html.replace("{{bundleJsUri}}", scriptUri.toString());
    panel.webview.html = html;

    const editor = vscode.window.activeTextEditor;
    let code = "";
    if (editor && editor.document.languageId === "python") {
      code = editor.document.getText();
    }

    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.type === "webviewReady") {
          panel.webview.postMessage({ type: "initialCode", code });
        } else if (message.type === "applyFix") {
          const editors = vscode.window.visibleTextEditors;
          const targetEditor = editors.find(
            (editor) => editor.document.languageId === "python"
          );

          if (!targetEditor) {
            vscode.window.showErrorMessage("❌ No open Python file to apply the fix.");
            return;
          }

          const document = targetEditor.document;
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );

          const success = await targetEditor.edit((editBuilder) => {
            editBuilder.replace(fullRange, message.code);
          });

          if (success) {
            vscode.window.showInformationMessage("✅ AI Fix applied successfully.");
          } else {
            vscode.window.showErrorMessage("❌ Failed to apply fix.");
          }
        } else if (message.type === "closePanel") {
          panel.dispose();
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

function deactivate() {
  console.log("AI Code Fixer extension deactivated.");
}

module.exports = { activate, deactivate };
