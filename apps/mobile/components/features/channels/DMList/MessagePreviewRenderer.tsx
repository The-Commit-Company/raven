import { ReactNode } from "react";
import { Platform, Text } from "react-native";
import { Renderer, RendererInterface } from "react-native-marked";

export class MessagePreviewRenderer extends Renderer implements RendererInterface {
    private isUnread: boolean
    private colors: any

    constructor(isUnread: boolean, colors: any) {
        super()
        this.isUnread = isUnread
        this.colors = colors
    }

    link(href: string): ReactNode {
        return (
            <Text
                key={this.getKey()}
                ellipsizeMode="tail"
                style={{
                    fontWeight: 'normal',
                    color: this.colors.primary,
                }}
            >
                {href}
            </Text>
        )
    }

    text(text: string): ReactNode {
        return (
            <Text
                key={this.getKey()}
                ellipsizeMode="tail"
                style={{
                    fontWeight: 'normal',
                    fontSize: 14,
                    color: this.isUnread ? this.colors.foreground : this.colors.grey,
                }}
            >
                {text}
            </Text>
        )
    }

    code(text: string): ReactNode {
        return (
            <Text
                key={this.getKey()}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                    backgroundColor: '#1E1E1E',
                    color: '#fff',
                    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
                    fontSize: 14,
                    padding: 2,
                    paddingHorizontal: 4,
                    borderRadius: 4,
                    fontWeight: this.isUnread ? 'bold' : 'normal',
                }}
            >
                {text}
            </Text>
        )
    }

    paragraph(children: ReactNode[]): ReactNode {
        return (
            <Text
                key={this.getKey()}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                    flexDirection: 'row',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    overflow: 'hidden',
                    lineHeight: 20,
                }}
            >
                {children}
            </Text>
        )
    }
}