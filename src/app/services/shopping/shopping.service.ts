import {AppService} from '../app.service';
import {SendShoppingResponse, SendShoppingResponseEntity, Shopping, ShoppingResponseEntity} from '../../model/shopping';
import {Messages} from '../../config/messages';
import {Utils} from '../utils/utils';
import {AppRoutes} from '../../config/routes';
import {map} from 'rxjs/operators';

/**
 * ShoppingService
 */
export class ShoppingService {

    /**
     * Constructor ShoppingService
     * @param appService
     */
    constructor(private appService: AppService) {
    }

    /**
     * @method getAllShoppings
     */
    public async getAllShoppings(showSpinner: boolean = true) {
        this.appService.presentLoading(showSpinner).then((loading: HTMLIonLoadingElement) => {
            const user = this.appService.secvars.user;
            this.appService.post(
                `es/api/v1/shopping/${this.appService.userType()}/${user.id}/index`
            ).pipe(map((resp: Shopping[]) => resp.map(shoppingData => new ShoppingResponseEntity(shoppingData, user))))
                .subscribe((resp: Shopping[]) => {
                        this.appService.shvars.setAllShoppings(resp);
                    },
                    err => {
                        this.appService.dismissLoading(loading).then(() => {
                            this.appService.presentToast(err.error.detail ? err.error.detail : Messages.ERROR_PLEASE_TRY_LATER,
                                'dark').then();
                        });
                    },
                    () => {
                        this.appService.dismissLoading(loading).then();
                    });
        });
    }

    /**
     * @method sendAllShopping
     */
    public async sendAllShopping() {
        this.appService.presentLoading().then((loading: HTMLIonLoadingElement) => {
            const user = this.appService.secvars.user;
            this.appService.post(
                `es/api/v1/shopping/${this.appService.userType()}/${user.id}/send-all`
            ).pipe(map((resp: SendShoppingResponse) => new SendShoppingResponseEntity(resp, user)))
                .subscribe(
                    (resp: SendShoppingResponse) => {
                        this.appService.setUser(resp.agent, true).then(() => {

                            setTimeout(() => {
                                this.appService.shvars.setAllShoppings(resp.shoppings);
                            }, 1000);

                            if (resp.shoppings.length == 0) {
                                this.appService.navigateToUrl(AppRoutes.APP_SUCCESS);
                            }

                        });
                    },
                    (err) => {
                        let error = err.error.detail ? err.error.detail : Messages.ERROR_PLEASE_TRY_LATER;
                        this.appService.dismissLoading(loading).then(() => {
                            this.appService.presentToast(error, 'dark').then();
                        });
                    },
                    () => {
                        this.appService.dismissLoading(loading).then();
                    });
        });
    }

    /**
     * @method addOneShoppingToCart
     * @param shopping
     */
    public async addOneShoppingToCart(shopping: Shopping) {
        this.appService.presentLoading().then((loading: HTMLIonLoadingElement) => {

            const data = Utils.getFormData({
                'account': shopping.account,
                'client': shopping.client,
                'service': shopping.service
            });

            this.appService.post(
                `es/api/v1/shopping/${this.appService.userType()}/${this.appService.secvars.user.id}/recharge/${shopping.recharge.id}/create`, data
            ).subscribe(
                (resp: Shopping[]) => {
                    this.appService.shvars.setAllShoppings(resp);
                },
                (err) => {
                    let error = err.error.detail ? err.error.detail : Messages.ERROR_PLEASE_TRY_LATER;
                    this.appService.dismissLoading(loading).then(() => {
                        this.appService.presentToast(error, 'dark').then();
                    });
                },
                () => {
                    this.appService.dismissLoading(loading).then(() => {
                        this.appService.presentToast(Messages.SUCCESS_ACTION, 'primary').then();
                    });
                });
        });
    }

    /**
     * @method removeOneShopping
     * @param shopping
     */
    public async removeOneShopping(shopping: Shopping) {
        this.appService.presentLoading().then((loading: HTMLIonLoadingElement) => {
            this.appService.post(
                `es/api/v1/shopping/${this.appService.userType()}/${this.appService.secvars.user.id}/shopping/${shopping.id}/delete`
            ).subscribe(
                (resp: Shopping[]) => {
                    this.appService.shvars.setAllShoppings(resp);
                },
                (err) => {
                    let error = err.error.detail ? err.error.detail : Messages.ERROR_PLEASE_TRY_LATER;
                    this.appService.dismissLoading(loading).then(() => {
                        this.appService.presentToast(error, 'dark').then();
                    });
                },
                () => {
                    this.appService.dismissLoading(loading).then(() => {
                        this.appService.presentToast(Messages.SUCCESS_ACTION, 'primary').then();
                    });
                });
        });
    }


}
