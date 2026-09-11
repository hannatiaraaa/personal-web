'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

type Props = {
  title: string;
  description: string;
  techStacks: string[];
  link: string;
  image?: string | StaticImageData;
};

const ProjectCard = (props: Props) => {
  const [isLoading, setLoading] = useState(true);
  const { title, image, description, techStacks, link } = props;

  const className = isLoading ? 'animate-pulse' : '';
  const imageClassName = isLoading ? 'scale-[1.02] blur-xl grayscale' : '';

  return (
    <div
      key={title}
      className='group relative flex flex-col rounded-lg border p-4'
    >
      <div className='pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100' />
      {image && (
        <div className={`overflow-hidden rounded-lg ${className}`}>
          <Image
            className={`transition-[scale,filter] duration-700 w-[75rem] h-[40rem] ${imageClassName}`}
            src={image}
            alt={title}
            loading='lazy'
            quality={100}
            onLoadingComplete={() => setLoading(false)}
          />
        </div>
      )}

      <div className='flex-1 px-2 py-4'>
        <div>
          <h2 className='text-2xl font-bold text-foreground'>{title}</h2>
          <div className='text-muted-foreground'>{description}</div>
        </div>
        <div className='flex flex-wrap space-x-1.5'>
          <span className='shrink-0'>Built with:</span>
          {techStacks.map((tool: string, index: number) => {
            return (
              <span
                key={index}
                className='font-semibold text-gray-600 dark:text-gray-300'
              >
                {tool}
                {index !== techStacks.length - 1 && ','}
              </span>
            );
          })}
        </div>
      </div>
      <Link
        href={link}
        className='text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400'
        aria-label={`Link to ${title}`}
      >
        Learn more &rarr;
      </Link>
    </div>
  );
};

export default ProjectCard;
