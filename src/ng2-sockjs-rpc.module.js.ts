import {NgModule, ModuleWithProviders} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SockJsRpcProvider} from "./ng2-sockjs-rpc.provider";

@NgModule({
	imports: [
		CommonModule
	],
	declarations: [
	],
	exports: [
	]
})
export class SockJsRpcModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: SockJsRpcModule,
			providers: [SockJsRpcProvider]
		};
	}
}
