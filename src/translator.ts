type Language = 'pl' | 'en';

type Translations = {
  [lang in Language]: {
    [key: string]: string;
  };
};

class Translator {
  private static instance: Translator;
  private language: Language = 'en';
  private languageSet = false;

  private translations: Translations = {
    pl: {
      'Your Variables': 'Twoje Zmienne',
      'A JupyterLab extension to easy manage variables.': 'Rozszerzenie JupyterLab do łatwego zarządzania zmiennymi.',
      'Settings': 'Ustawienia',
      'Show type': 'Pokaż typ',
      'Show shape': 'Pokaż wymiar',
      'Show size': 'Pokaż rozmiar',
      'Refresh variables': 'Odśwież zmienne',
      'Search variable...': 'Wyszukaj zmienne...',
      'Loading variables...': 'Wczytywanie zmiennych...',
      'Sorry, no variables available.': 'Brak dostępnych zmiennych.',
      'Name': 'Nazwa',
      'Type': 'Typ',
      'Shape': 'Wymiar',
      'Size': 'Rozmiar',
      'Value': 'Wartość',
      'Rows from ': 'Wiersze od ',
      'Display first 100 rows': 'Wyświetl pierwsze 100 wierszy',
      'Display previous 100 rows': 'Wyświetl poprzednie 100 wierszy',
      'Start with row': 'Początkowy wiersz',
      'to ': 'do ',
      'Display next 100 rows': 'Wyświetl następne 100 wierszy',
      'Display last 100 rows': 'Wyświetl ostatnie 100 wierszy',
      'Total': 'Łącznie',
      'rows': 'wierszy',
      'Columns from ': 'Kolumny od ',
      'Display first 50 columns': 'Wyświetl pierwsze 50 kolumn',
      'Display previous 50 columns': 'Wyświetl poprzednie 50 kolumn',
      'Start with column': 'Początkowa kolumna',
      'Display next 50 columns': 'Wyświetl następne 50 kolumn',
      'Display last 50 columns': 'Wyświetl ostatnie 50 kolumn',
      'columns': 'kolumn',
      'Wrong variable type:': 'Błędny typ zmiennej:',
      'Show value': "Pokaż wartość",
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
    if (this.language === 'en') return text;
    const langTranslations = this.translations[this.language];
    return langTranslations[text] || text;
  }
}

export const translator = Translator.getInstance();
export const t = (text: string) => translator.translate(text);
