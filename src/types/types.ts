export enum ActiveTab {
  Preview = 'preview',
  Code = 'code',
}

export enum UserType {
  User = 'user',
  AI = 'ai',
}

export enum AIModel {
  Gemini = 'gemini',
  Claude = 'claude',
}

export interface ChatMessage {
  id: string;
  sender: UserType;
  text: string;
  isHtml?: boolean; // To indicate if the text is raw HTML (though we'll mostly use text confirmation for AI HTML)
}

export interface ModelInfo {
  id: AIModel;
  name: string;
  description: string;
  provider: string;
}
