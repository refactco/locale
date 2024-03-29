import { NestedLocale } from '../nested-locale/nested-locale';
import { StringFormat } from '../string-format/string-format';
import { ILocale, ILocaleEntry, INestedResource, IResource } from './main-interface';

export class Locale implements ILocale {
  private resources: IResource;

  private nestedResources: INestedResource = {};

  public constructor(entry: ILocaleEntry) {
    const { language, localeObject } = entry;

    this.resources = localeObject[language];
  }

  public translate(key: string, stringFormatData?: string[]): string {
    const { resources } = this;
    const { [key]: value } = resources;

    if (typeof value === 'string') {
      const stringFormat: StringFormat = new StringFormat();

      return stringFormat.format(value, stringFormatData);
    }

    return JSON.stringify(value) || key;
  }

  public getCollection(chain: string): ILocale {
    const nestedResources: IResource = this.getNestedObject(chain);

    return new NestedLocale(nestedResources);
  }

  private getNestedObject(chain: string): IResource {
    if (!this.nestedResources[chain]) {
      const splitChain: string[] = chain.split('.');
      let { resources } = this;

      splitChain.forEach((value: string): void => {
        const nestedResources: IResource | string = resources[value];
        if (typeof nestedResources === 'object') {
          resources = nestedResources;
        } else {
          throw new Error('The value of your requested chain is not an object');
        }
      });

      this.nestedResources[chain] = resources;
    }

    return this.nestedResources[chain];
  }
}
