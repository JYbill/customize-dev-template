export class NprogressSetting {
  static settingNprogress(context: any, id: string='nprogress'): void {
    context.selectComponent(`#${id}`).setting({
      
    });
  }
}