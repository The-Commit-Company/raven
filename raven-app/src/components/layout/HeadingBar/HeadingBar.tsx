import { Badge, Flex, HStack, Progress, Text } from "@chakra-ui/react";
import React from "react";

// type Props = {};

interface HeadingBarProps {
  headerComponent: React.ReactNode;
  rightComponent?: React.ReactNode;
}

export const HeadingBar = ({
  headerComponent,
  rightComponent,
}: HeadingBarProps) => {
  return (
    <Flex
      width="full"
      bg="gray.500"
      height="50"
      alignItems="center"
      justifyContent="space-between"
    >
      {headerComponent}
      {rightComponent}
    </Flex>
  );
};

interface HeadingBarHeaderProps {
  header: string;
}

export const HeadingBarHeader = ({ header }: HeadingBarHeaderProps) => {
  return (
    <Text ml="10" color="white" fontSize="2xl">
      {header}
    </Text>
  );
};
interface HeadingBarRightElementProps {
  percentage: number;
  status: string;
}

export const HeadingBarRightElement = ({
  percentage,
  status,
}: HeadingBarRightElementProps) => {
  return (
    <Flex alignItems={"center"}>
      <HStack
        spacing={2}
        padding="6"
        mr="2"
      >
        <Progress
          colorScheme="green"
          size="sm"
          value={percentage}
          width="32"
          height="3"
          rounded="md"
          border="1px solid white"
        />
        <Text color="green.300" paddingRight="3">
          {percentage}%
        </Text>
        <Badge
          colorScheme="green"
          rounded="md"
          bg="white"
          px="4"
          variant="outline"
          py="1"
        >
          {status}
        </Badge>
      </HStack>
    </Flex>
  );
};
