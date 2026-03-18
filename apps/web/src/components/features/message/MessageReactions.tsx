import { memo, useCallback, useMemo } from 'react';
import { Button } from '@components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@components/ui/tooltip';
import { ReactionObject } from '@raven/types/common/ChatStream';
import { UserFields } from '@raven/types/common/UserFields';
import { cn } from '@lib/utils';
import { SmilePlus } from 'lucide-react';

interface MessageReactionsProps {
  reactions: ReactionObject[];
  allUsers: Record<string, UserFields>;
  currentUserId?: string;
  onReactionClick?: (emoji: string, isCustom?: boolean, emojiName?: string) => void;
  onAddReaction?: () => void;
  className?: string;
}

interface ReactionButtonProps {
  reaction: ReactionObject;
  isUserReacted: boolean;
  allUsers: Record<string, UserFields>;
  currentUserId: string;
  onClick?: () => void;
}

const getUsers = (
  users: string[],
  currentUser: string,
  allUsers: Record<string, UserFields>
): string => {
  const userNames = users.map(userId => {
    if (userId === currentUser) return 'You';
    return allUsers[userId]?.full_name || userId;
  });

  if (userNames.length === 0) return '';
  if (userNames.length === 1) return userNames[0];
  if (userNames.length === 2) return `${userNames[0]} and ${userNames[1]}`;
  if (userNames.length <= 3) {
    return `${userNames.slice(0, -1).join(', ')}, and ${userNames[userNames.length - 1]}`;
  }
  return `${userNames.slice(0, 2).join(', ')}, and ${userNames.length - 2} others`;
};

const ReactionButton = memo<ReactionButtonProps>(({
  reaction,
  isUserReacted,
  allUsers,
  currentUserId,
  onClick
}) => {
  const { reaction: emoji, users, count, emoji_name } = reaction;

  const tooltipContent = useMemo(() => {
    const userList = getUsers(users, currentUserId, allUsers);
    return `${userList} reacted with ${emoji_name}`;
  }, [users, currentUserId, allUsers, emoji_name]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  }, [onClick]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-2 py-1 text-xs gap-1 min-w-0 font-normal transition-all hover:scale-105 cursor-pointer rounded-md border",
              isUserReacted
                ? "bg-blue-500/10 hover:bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/5 dark:hover:bg-blue-500/10 dark:border-blue-500/30"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
            )}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            aria-label={`${isUserReacted ? 'Remove' : 'Add'} reaction ${emoji_name}. ${tooltipContent}`}
            aria-pressed={isUserReacted}
            role="button"
          >
            {reaction.is_custom ? (
              <img
                src={emoji}
                alt={emoji_name}
                loading="lazy"
                className="w-4 h-4 object-contain"
                aria-hidden="true"
              />
            ) : (
              <span className="text-sm leading-none" aria-hidden="true">
                {emoji}
              </span>
            )}
            <span className="tabular-nums text-xs text-gray-700 dark:text-gray-300" aria-hidden="true">{count}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-96">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

ReactionButton.displayName = 'ReactionButton';

const AddReactionButton = memo<{
  onAddReaction?: () => void;
  disabled?: boolean;
}>(({ onAddReaction, disabled = false }) => {
  const handleClick = useCallback(() => {
    if (disabled) return;
    onAddReaction?.();
  }, [onAddReaction, disabled]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-105 rounded-md border border-gray-200 dark:border-gray-600"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label="Add reaction"
      role="button"
    >
      <SmilePlus size={14} aria-hidden="true" />
    </Button>
  );
});

AddReactionButton.displayName = 'AddReactionButton';

export const MessageReactions = memo<MessageReactionsProps>(({
  reactions,
  allUsers,
  currentUserId = '',
  onReactionClick,
  onAddReaction,
  className
}) => {
  const handleReactionClick = useCallback((
    emoji: string,
    isCustom?: boolean,
    emojiName?: string
  ) => {
    onReactionClick?.(emoji, isCustom, emojiName);
  }, [onReactionClick]);

  if (reactions.length === 0 && !onAddReaction) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap gap-1 mt-1.5 ml-12", className)}
      role="group"
      aria-label="Message reactions"
    >
      {reactions.map((reaction) => {
        const isUserReacted = currentUserId ? reaction.users.includes(currentUserId) : false;

        return (
          <ReactionButton
            key={reaction.emoji_name}
            reaction={reaction}
            isUserReacted={isUserReacted}
            allUsers={allUsers}
            currentUserId={currentUserId}
            onClick={() => handleReactionClick(reaction.reaction, reaction.is_custom, reaction.emoji_name)}
          />
        );
      })}

      {onAddReaction && (
        <AddReactionButton
          onAddReaction={onAddReaction}
          disabled={!currentUserId}
        />
      )}
    </div>
  );
});

MessageReactions.displayName = 'MessageReactions';