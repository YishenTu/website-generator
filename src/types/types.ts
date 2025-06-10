export enum ActiveTab {
  Input = 'input',
  Plan = 'plan',
  Code = 'code',
  Preview = 'preview',
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
