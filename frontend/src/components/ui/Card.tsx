import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../utils/animations';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  const Component = hover ? motion.div : 'div';

  return (
    <Component
      className={clsx(
        'card bg-white rounded-xl shadow-soft p-6',
        hover && 'cursor-pointer',
        className
      )}
      initial={hover ? 'rest' : undefined}
      whileHover={hover ? 'hover' : undefined}
      variants={hover ? cardHoverVariants : undefined}
      onClick={onClick}
    >
      {children}
    </Component>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={clsx('border-b border-neutral-200 pb-4 mb-4', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h3 className={clsx('text-xl font-semibold text-neutral-900', className)}>
    {children}
  </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <p className={clsx('text-sm text-neutral-600 mt-1', className)}>
    {children}
  </p>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={clsx('', className)}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={clsx('border-t border-neutral-200 pt-4 mt-4', className)}>
    {children}
  </div>
);
