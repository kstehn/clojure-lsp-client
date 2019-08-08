import { exec } from "child_process";
import * as path from 'path';
import { ExtensionContext, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient';

const isWin = /^win/.test(process.platform);

let client: LanguageClient;

function execute(command:string, callback:any) {
	exec(command, function (error, stdout, stderr) { 
		callback(stdout); });
}

function startClient(lspPath:string) {
	let serverModule =  '/g/dev-bin/clojure-lsp' ;  //path.posix.normalize(lspPath);

	console.log("serverModule", serverModule);
	console.log("lspPath",lspPath);

	if (!serverModule) {
		console.log("No clojure-lsp found in PATH.");
		return;
	}
	serverModule = path.resolve(lspPath);
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: {}
		}
	};

	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'clojureLSP',
		'Clojure Language Server',
		serverOptions,
		clientOptions
	);

	client.start();

	console.log('Clojure-LSP started');
}

export function activate(context: ExtensionContext) {
	let command = isWin? "where clojure-lsp" : "which clojure-lsp";

	execute(command, startClient);
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
