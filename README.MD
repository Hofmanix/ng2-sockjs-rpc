# ng2-sockjs-rpc

## Installation

To install this library, run:

```bash
$ npm install ng2-sockjs-rpc --save
```

## Consuming your library

Once you have published your library to npm, you can import your library in any Angular application by running:

```bash
$ npm install ng2-sockjs-rpc
```

and then from your Angular `AppModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { SockJsRpcModule } from 'ng2-sockjs-rpc';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // Specify your library as an import
    SockJsRpcModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Once your library is imported, you can use its provider, in your Angular application like this:

```typescript
import { Component } from '@angular/core';

import { SockJsRpcProvider, WSType } from 'ng2-sockjs-rpc';


@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	rootPage = LoadingPage;

	constructor(sockJsRpcProvider: SockJsRpcProvider) {
		
		sockJsRpcProvider.connect("http://localhost:8080/site").subscribe(() => {
			//SockJsRpc is connected
			sockJsRpcProvider.call("SomeController.someMethod", {
				//Object to send to server
				//will be sent as json string and will be used as object
				//which someMethod accepts
			}).subscribe(response => {
				//Function on server was completed and response is what server function returned
			});
		});
	}
}

//You can also choose to use classic websockets by adding type to the connect function
sockJsRpcProvider.connect("ws://localhost", WSType.WEBSOCKETS).subscribe();

```

## Development

To generate all `*.js`, `*.js.map` and `*.d.ts` files:

```bash
$ npm run tsc
```
## License

MIT © [Ondřej Hartman](mailto:ondrejhartman@hotmail.com)
