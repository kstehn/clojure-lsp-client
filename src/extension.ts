import { CancellationToken, EventEmitter, ExtensionContext, Uri, workspace } from 'vscode';
import { LanguageClient, RequestType } from 'vscode-languageclient';

const isWin = /^win/.test(process.platform);
let jarEventEmitter: EventEmitter<Uri> = new EventEmitter();
let contentsRequest = new RequestType<string, string, string, CancellationToken>('clojure/dependencyContents');

let client: LanguageClient;

export function activate(context: ExtensionContext) {
 	let serverModule = isWin ? "clojure-lsp.bat" : "clojure-lsp";

	let serverOptions = {
		run: { command: "bash", args: ["-c", "clojure-lsp"] },
		debug: { command: 'bash', args: ["-c", "clojure-lsp"] }
	};

	let clientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'clojure' }],
		synchronize: {
			configurationSection: 'clojure-lsp',
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		},
		initializationOptions: {
			"dependency-scheme": "jar"
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'clojureLSP',
		'Clojure Language Client',
		serverOptions,
		clientOptions
	);

	context.subscriptions.push(client.start());

	/* let provider = {
		onDidChange: jarEventEmitter.event,
		provideTextDocumentContent: (uri: Uri, token: CancellationToken): Thenable<string> => {
			return client.sendRequest<any, string, string, CancellationToken>(contentsRequest,
				{ uri: decodeURIComponent(uri.toString()) },
				token).then((v: string) => {
					return v || '';
				});
		}
	};
	context.subscriptions.push(workspace.registerTextDocumentContentProvider('jar', provider)); */

	console.log('Clojure-LSP started');
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
