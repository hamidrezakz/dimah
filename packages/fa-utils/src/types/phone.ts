export type IranPhoneTarget = "ui" | "db";
export type IranPhoneDigits = "fa" | "en";
export type UiDigits = IranPhoneDigits;

export type FormatIranPhoneOptions = {
  target?: IranPhoneTarget;
  digits?: IranPhoneDigits;
  uiDigits?: UiDigits;
};
