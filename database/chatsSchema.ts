import { Content, Part } from "@google/genai";
import { model, Schema } from "mongoose";
import { ChatMessage } from "../models/chat";

const PartSchema = new Schema({
    text: { type: String, required: false },
})

const ContentSchema = new Schema({
    parts: [PartSchema],
    role: { type: String, enum: ["user", "model"] },
}, { _id: false });

const ChatSchema = new Schema({
    chatId: { type: String, required: true, unique: true },
    content: [ContentSchema],
}, { _id: false });

const ChatModel = model<ChatDoc>("Chat", ChatSchema);
export default ChatModel;

// --- Documents ---
export interface PartDoc extends Document {
    text: string;
}

export interface ContentDoc extends Document {
    parts: PartDoc[];
    role: string;
}

export interface ChatDoc extends Document {
    chatId: string;
    content: ContentDoc[];
}

const fromPartDoc = (doc: PartDoc): Part => {
    return {
        text: doc.text,
    };
}

const fromContentDoc = (doc: ContentDoc): Content => {
    return {
        parts: doc.parts.map(fromPartDoc),
        role: doc.role,
    };
}

const fromChatDoc = (doc: ChatDoc): Content[] => {
    return doc.content.map(fromContentDoc);
}

// ---
const toPartDoc = (message: string): PartDoc => {
    return {
        text: message,
    } as PartDoc;
}

const toContentDoc = (message: ChatMessage): ContentDoc => {
    return {
        parts: [toPartDoc(message.content)],
        role: message.role,
    } as ContentDoc;
}
