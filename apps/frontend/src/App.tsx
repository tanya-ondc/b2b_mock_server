import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Layout } from "./layout/Layout";
import { Analyse, Landing, Mock, Sandbox, Sign, Swagger } from "./pages";
import {
	B2BSwagger,
	MiscSwagger,
	ServicesSwagger,
} from "./pages/swagger/domains";
import {
	AnalyseProvider,
	DomainProvider,
	MessageProvider,
	MockProvider,
	SandboxProvider,
} from "./utils/context";
import { B2BMock, ServicesMock } from "./pages/mock/domains";
import {
	B2BSandbox,
	LogisticsSandbox,
	ServicesSandbox,
} from "./pages/sandbox/domains";
import Readme from "./pages/readme";
import { B2CMock } from "./pages/mock/domains/b2c";
import { B2CSandbox } from "./pages/sandbox/domains/b2c";
import { LogisticsMock } from "./pages/mock/domains/logistics";
import { LogisticsSwagger } from "./pages/swagger/domains/logistics";
import { AgriSandbox } from "./pages/sandbox/domains/agri";
import { AgriMock } from "./pages/mock/domains/agri";
// log

const router = createBrowserRouter([
	{
		path: "/",
		Component: Layout,
		children: [
			{
				path: "/",
				Component: Landing,
			},
			{
				path: "/user-guide",
				Component: Readme,
			},
			{
				path: "/sign-check",
				Component: Sign,
			},
			{
				path: "/mock",
				Component: () => (
					<MockProvider>
						<Mock />
					</MockProvider>
				),
				children: [
					{
						path: "b2b",
						Component: B2BMock,
					},
					{
						path: "b2c",
						Component: B2CMock,
					},
					{
						path: "services",
						Component: ServicesMock,
					},
					{
						path: "logistics",
						Component: LogisticsMock,
					},
					{
						path: "agri",
						Component: AgriMock,
					},
				],
			},
			{
				path: "/sandbox",
				Component: () => (
					<SandboxProvider>
						<Sandbox />
					</SandboxProvider>
				),
				children: [
					{
						path: "b2b",
						Component: B2BSandbox,
					},
					{
						path: "b2c",
						Component: B2CSandbox,
					},
					{
						path: "services",
						Component: ServicesSandbox,
					},
					{
						path: "logistics",
						Component: LogisticsSandbox,
					},
					{
						path: "agri",
						Component: AgriSandbox,
					},
				],
			},
			{
				path: "/swagger/misc",
				Component: MiscSwagger,
			},
			{
				path: "/swagger",
				Component: Swagger,
				children: [
					{ path: "b2b", Component: B2BSwagger },
					{ path: "b2c", Component: B2BSwagger },
					{ path: "services", Component: ServicesSwagger },
					{ path: "logistics", Component: LogisticsSwagger },
				],
			},
			{
				path: "/analyse",
				Component: () => (
					<AnalyseProvider>
						<Analyse />
					</AnalyseProvider>
				),
			},
		],
	},
]);

export default function App() {
	return (
		<MessageProvider>
			<DomainProvider>
				<RouterProvider router={router} />
			</DomainProvider>
		</MessageProvider>
	);
}
