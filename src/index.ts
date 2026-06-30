import 'dotenv/config';
import { VK } from 'vk-io';
import { createCanvas } from 'canvas';
import { colord } from 'colord';

const token = process.env.TOKEN;
if (!token) {
    throw new Error('TOKEN не найден в .env');
}

const vk = new VK({
    token,
    apiLimit: 20
});

function isValidHEXColor(color: string): boolean {
    if (color === 'random') return true;
    return colord(color).isValid();
}

interface ImageParams {
    width: number;
    height: number;
    color: string;
}

async function generateImage({ width, height, color }: ImageParams): Promise<Buffer> {
    const image = createCanvas(width, height);
    const context = image.getContext('2d');

    context.fillStyle = color;
    context.fillRect(0, 0, width, height);

    return image.toBuffer();
}

async function handleAttachment(peer_id: number, imageBuffer: Buffer): Promise<any> {
    const attachment = await vk.upload.messagePhoto({
        peer_id,
        source: {
            value: imageBuffer
        }
    });

    return attachment;
}

vk.updates.on('message_new', async (context) => {
    if (context.text === '/') {
        const attachment = await handleAttachment(context.peer_id, await generateImage({ width: 800, height: 600, color: 'black' }));

        await context.send({
            message: 'Вот ваше изображение!',
            attachment
        });
    }
});

vk.updates.start().then(() => {
    console.log('Бот запущен');
});