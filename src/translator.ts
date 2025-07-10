type Language = 'pl' | 'de' | 'fr' | 'en';

type Translations = {
  [lang in Language]: {
    [key: string]: string
  }
};

class Translator {
  private static instance: Translator;
  private language: Language = 'en';
  private languageSet = false;

  private translations: Translations = {
      pl: {
          'Variable Inspector': 'Inspektor Zmiennych',
          'Goodbye': 'Do widzenia',
      },
      de: {
          'Hello': 'Hallo',
          'Goodbye': 'Auf Wiedersehen',
      },
      fr: {
          'Hello': 'Bonjour',
          'Goodbye': 'Au revoir',
      },
      en: {}
  };

  private constructor() {}

  public static getInstance(): Translator {
    if (!Translator.instance) {
      Translator.instance = new Translator();
    }
    return Translator.instance;
  }

  public setLanguage(lang: Language) {
    if (this.languageSet) {
      throw new Error('Language can only be set once!');
    }
    this.language = lang;
    this.languageSet = true;
  }

  public translate(text: string): string {
    console.log("jezyk", this.language);
    if (this.language === "en") return text;
    const langTranslations = this.translations[this.language];
    return langTranslations[text] || text;
  }
}

// Eksportujesz translator i funkcję t:
export const translator = Translator.getInstance();
export const t = (text: string) => translator.translate(text);
