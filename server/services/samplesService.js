import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { FFMPEG_BIN } from './ffmpegService.js';

export const SAMPLE_VIDEOS = [
  {
    id: 'sample-tech-ai',
    title: 'The AI Revolution: Autonomous Agents & The Future',
    category: 'Tech & AI Podcast',
    duration: 60,
    speaker: 'Alex Rivera & Dr. Elena Vance',
    description: 'An insightful discussion exploring how autonomous AI agents are disrupting software development and how human creators can multiply their productivity.',
    thumbnail: '/storage/thumbs/sample-tech-ai.jpg',
    videoPath: 'storage/samples/sample-tech-ai.mp4',
    url: 'https://clipgenius.ai/samples/tech-ai.mp4',
    transcripts: [
      { start: 0.0, end: 4.5, text: "The biggest mistake people make right now is thinking AI is just a glorified chatbot." },
      { start: 4.8, end: 9.2, text: "It's not about typing a question and getting a paragraph back anymore." },
      { start: 9.5, end: 14.8, text: "We are entering the era of autonomous execution where software builds itself." },
      { start: 15.2, end: 20.0, text: "If you give an AI agent a goal, it writes the code, tests it, and fixes its own bugs." },
      { start: 20.5, end: 26.2, text: "Think about this: a solo founder today has the leverage of a 50-person engineering team." },
      { start: 26.8, end: 31.4, text: "That is an unprecedented shift in human leverage that has never happened in history." },
      { start: 32.0, end: 36.5, text: "So what separates the winners from the losers over the next five years?" },
      { start: 37.0, end: 42.5, text: "It is not who knows how to code from scratch; it is who knows how to direct and orchestrate." },
      { start: 43.0, end: 48.2, text: "Curiosity and taste are the only moats that truly matter when intelligence becomes free." },
      { start: 48.8, end: 54.0, text: "Stop waiting for permission. The tools are here, the models are ready, and the audience is waiting." },
      { start: 54.5, end: 59.5, text: "Because in the age of exponential intelligence, waiting is the only guaranteed way to fail." }
    ]
  },
  {
    id: 'sample-startup-mindset',
    title: 'The #1 Secret of Scaling: Hook Psychology & Attention',
    category: 'Business & Motivation',
    duration: 55,
    speaker: 'Marcus Vance',
    description: 'A punchy masterclass on overcoming distraction, choosing high-leverage bottlenecks, and mastering consumer attention on social media.',
    thumbnail: '/storage/thumbs/sample-startup-mindset.jpg',
    videoPath: 'storage/samples/sample-startup-mindset.mp4',
    url: 'https://clipgenius.ai/samples/startup-mindset.mp4',
    transcripts: [
      { start: 0.0, end: 4.8, text: "Do you want to know why 99% of creators never make a dime online?" },
      { start: 5.2, end: 9.5, text: "It is not because their content is bad; it is because they have zero hook." },
      { start: 10.0, end: 15.0, text: "You have less than 1.5 seconds to stop the thumb on Instagram Reels or TikTok." },
      { start: 15.5, end: 20.8, text: "If your first frame is you saying 'Hey guys, welcome back to my channel', you lost." },
      { start: 21.2, end: 26.5, text: "Start in the middle of the action. Start with the consequence. Start with the mystery." },
      { start: 27.0, end: 32.8, text: "Say 'I lost $50,000 yesterday, and here is the exact lesson you must avoid.'" },
      { start: 33.2, end: 38.5, text: "Notice how that immediately opens an open loop in the viewer's brain?" },
      { start: 39.0, end: 44.5, text: "Pair that strong hook with dynamic word-by-word captions so people can watch on mute." },
      { start: 45.0, end: 50.0, text: "Eighty-five percent of mobile video viewers have their audio turned completely off." },
      { start: 50.5, end: 54.5, text: "Stop over-polishing and start shipping. High volume plus high taste equals inevitable growth." }
    ]
  },
  {
    id: 'sample-creator-productivity',
    title: 'How Top Creators Produce 30 Shorts a Week Without Burnout',
    category: 'Creator Masterclass',
    duration: 50,
    speaker: 'Sarah Jenkins',
    description: 'Practical creator workflow detailing batch recording, automated vertical reframing, and AI-assisted caption generation.',
    thumbnail: '/storage/thumbs/sample-creator-productivity.jpg',
    videoPath: 'storage/samples/sample-creator-productivity.mp4',
    url: 'https://clipgenius.ai/samples/creator-productivity.mp4',
    transcripts: [
      { start: 0.0, end: 4.2, text: "How do the top creators post three times a day across every single platform?" },
      { start: 4.6, end: 9.0, text: "They are not sitting at their desks 14 hours a day cutting video in Premiere Pro." },
      { start: 9.5, end: 14.5, text: "They use automated clipping pipelines that turn one recording into thirty pieces of content." },
      { start: 15.0, end: 20.2, text: "They sit down on Monday, record one 45-minute deep conversation or solo episode." },
      { start: 20.8, end: 26.0, text: "Then they run it through an AI clipper that scans the audio for emotional spikes." },
      { start: 26.5, end: 32.0, text: "The AI automatically crops the speaker into 9:16 vertical, adds captions, and scores each clip." },
      { start: 32.5, end: 38.0, text: "By Tuesday morning, their entire content calendar for the next two weeks is completely full." },
      { start: 38.5, end: 44.2, text: "This is how you build a media empire without hiring a full production agency." },
      { start: 44.8, end: 49.5, text: "Work smarter, post consistently, and let the algorithm do the rest." }
    ]
  }
];

/**
 * Generate a clean sample video if not present on disk.
 */
export async function ensureSampleVideoFiles(baseDir) {
  const samplesDir = path.join(baseDir, 'storage', 'samples');
  const thumbsDir = path.join(baseDir, 'storage', 'thumbs');

  if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });
  if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

  for (const sample of SAMPLE_VIDEOS) {
    const videoFullPath = path.join(baseDir, sample.videoPath);
    const thumbFullPath = path.join(baseDir, 'storage', 'thumbs', `${sample.id}.jpg`);

    if (!fs.existsSync(videoFullPath) || !fs.existsSync(thumbFullPath)) {
      await generateSyntheticSampleVideo(videoFullPath, thumbFullPath, sample);
    }
  }
}

function generateSyntheticSampleVideo(videoPath, thumbPath, sample) {
  return new Promise((resolve) => {
    // Generate a reliable test pattern with sine audio tone
    const args = [
      '-y',
      '-f', 'lavfi', '-i', `testsrc=size=1280x720:rate=25`,
      '-f', 'lavfi', '-i', `sine=frequency=440:sample_rate=48000:duration=${sample.duration}`,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '96k',
      '-t', sample.duration.toString(),
      videoPath
    ];

    const child = spawn(FFMPEG_BIN, args);
    child.on('close', (code) => {
      if (code === 0) {
        const thumbArgs = ['-y', '-ss', '1.0', '-i', videoPath, '-vframes', '1', '-q:v', '3', thumbPath];
        const thumbChild = spawn(FFMPEG_BIN, thumbArgs);
        thumbChild.on('close', () => resolve());
        thumbChild.on('error', () => resolve());
      } else {
        resolve();
      }
    });

    child.on('error', () => {
      resolve();
    });
  });
}
