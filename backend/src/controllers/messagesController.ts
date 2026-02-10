import { Response } from 'express';
import { AuthRequest } from '../types';
import { ThreadModel, MessageModel } from '../models/Thread';
import { z } from 'zod';

const createThreadSchema = z.object({
  userId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  text: z.string().min(1).max(5000),
});

export const getThreads = async (req: AuthRequest, res: Response) => {
  const threads = await ThreadModel.getByUserId(req.user!.id);
  res.json({ threads });
};

export const createThread = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = createThreadSchema.parse(req.body);

    // Create or find thread between two users
    const thread = await ThreadModel.findOrCreate([req.user!.id, userId]);

    res.status(201).json({ thread });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw error;
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  const messages = await MessageModel.getByThreadId(req.params.threadId);
  res.json({ messages });
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = sendMessageSchema.parse(req.body);
    const threadId = req.params.threadId;

    const message = await MessageModel.create(threadId, req.user!.id, text);
    const fullMessage = (await MessageModel.getByThreadId(threadId)).find(m => m.id === message.id);

    // Emit socket event (will be handled by socket.io)
    (req.app as any).io?.to(threadId).emit('new_message', fullMessage);

    res.status(201).json({ message: fullMessage });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    throw error;
  }
};
