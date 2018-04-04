import {userIsAuthenticatedRedir, userIsNotAuthenticatedRedir} from 'wbc-components/lib/utils/JWTAuthentication/auth';
import LoginPage from './LoginPage';
import LayoutComponent from './LayoutComponent';
import {routes as NotFoundRoutes} from './modules/notFound/routes';
import {routes as HomeRoutes} from './modules/home/routes';
import {routes as SchedulerRoutes} from './modules/scheduler/routes';
import {routes as EmployeesRoutes} from './modules/employees/routes';
import {routes as VehiclesRoutes} from './modules/vehicles/routes';
// import {routes as TranslationManagementRoutes} from './modules/translationManagement/routes';
import {routes as ContactsRoutes} from './modules/contacts/routes';
import {routes as DivisionsRoutes} from './modules/divisions/routes';
import {routes as ContractsRoutes} from './modules/contracts/routes';
import {routes as BenefitTypesRoutes} from './modules/setting/benefitTypes/routes';
import {routes as ProductTypesRoutes} from './modules/setting/productTypes/routes';
import {routes as SkillsRoutes} from './modules/setting/skills/routes';
import {routes as UsersRoutes} from './modules/setting/users/routes';
import {routes as VatRatesRoutes} from './modules/setting/vatRates/routes';
import {routes as VehicleTypesRoutes} from './modules/setting/vehicleTypes/routes';
import {routes as InvoicesDueDateDaysRoutes} from './modules/setting/invoicesDueDateDays/routes';
import {routes as InterventionsRoutes} from './modules/interventions/routes';
import {routes as InterventionsProgRoutes} from './modules/interventionsProg/routes';
import Logging from './Logging';

const moduleRoutes = [
	...HomeRoutes,
	...SchedulerRoutes,
	...EmployeesRoutes,
	...VehiclesRoutes,
	// ...TranslationManagementRoutes,
	...ContactsRoutes,
	...DivisionsRoutes,
	...ContractsRoutes,
	...BenefitTypesRoutes,
	...ProductTypesRoutes,
	...SkillsRoutes,
	...UsersRoutes,
	...VatRatesRoutes,
	...VehicleTypesRoutes,
	...InvoicesDueDateDaysRoutes,
	...InterventionsRoutes,
	...InterventionsProgRoutes,
	// todo routes to be completed with other modules
];

const Login = userIsNotAuthenticatedRedir(LoginPage);
const Layout = userIsAuthenticatedRedir(Logging)(LayoutComponent);

const routes = [{
	path: '/login',
	exact: true,
	component: Login
}, {
	path: '/',
	component: Layout,
	routes: [
		...moduleRoutes,
		...NotFoundRoutes
	]
}];

export default routes;