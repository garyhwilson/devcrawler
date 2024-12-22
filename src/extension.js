const vscode = require('vscode');
const path = require('path');

function activate(context) {
  let currentPanel = undefined;

  let disposable = vscode.commands.registerCommand('devcrawler.start', () => {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.One);
      return;
    }

    currentPanel = vscode.window.createWebviewPanel(
      'devcrawler',
      'DevCrawler',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    const scriptPathOnDisk = vscode.Uri.file(
      path.join(context.extensionPath, 'dist', 'game.js')
    );
    const scriptUri = currentPanel.webview.asWebviewUri(scriptPathOnDisk);

    currentPanel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DevCrawler</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    background-color: #1e1e1e;
                }
                #gameContainer {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #gameCanvas {
                    background-color: #000;
                }
                #loadingScreen {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: #1e1e1e;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: #fff;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 24px;
                }
                .hidden {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <div id="gameContainer">
                <canvas id="gameCanvas" width="800" height="600"></canvas>
                <div id="loadingScreen">Loading DevCrawler...</div>
            </div>
            <script>
                // Initialize before loading game script
                console.log('Initializing game environment...');
            </script>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;

    currentPanel.onDidDispose(
      () => {
        currentPanel = undefined;
      },
      null,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};
