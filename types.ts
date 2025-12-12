export type Role = 'user' | 'model';

export interface Source {
  uri: string;
  title: string;
}

export interface ResponseImage {
  url: string;
  alt: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  sources?: Source[];
  image?: string;
  responseImages?: ResponseImage[];
}