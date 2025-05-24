
export enum ActiveTab {
  Preview = 'preview',
  Code = 'code',
}

export enum UserType {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: UserType;
  text: string;
  isHtml?: boolean; // To indicate if the text is raw HTML (though we'll mostly use text confirmation for AI HTML)
}
