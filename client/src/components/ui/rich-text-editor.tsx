import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";

import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Quote,
  Minus,
  CornerDownLeft,
} from "lucide-react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Enter content here...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure hard break to preserve line breaks
        hardBreak: {
          keepMarks: true,
        },
        // Configure paragraph to better handle whitespace
        paragraph: {
          HTMLAttributes: {
            class: "tiptap-paragraph",
          },
        },
      }),
      Underline,
      Strike,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Blockquote,
      HorizontalRule,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-3",
          "prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1",
          "prose-strong:font-semibold prose-em:italic",
          "prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4",

          "prose-table:border-collapse prose-table:border prose-table:border-gray-300",
          "prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2",
          "prose-td:border prose-td:border-gray-300 prose-td:p-2",

          "text-foreground whitespace-pre-line",
          disabled && "opacity-50 cursor-not-allowed"
        ),
      },
      handleKeyDown: (view, event) => {
        // Handle Shift+Enter as line break, Enter as paragraph break
        if (event.key === "Enter" && event.shiftKey) {
          return editor?.commands.setHardBreak() || false;
        }
        return false;
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    tooltip,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    tooltip?: string;
  }) => {
    const button = (
      <Button
        type="button"
        variant={isActive ? "default" : "ghost"}
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent focus loss
          onClick();
        }}
        disabled={disabled}
        className={cn(
          "h-8 w-8 p-0",
          isActive && "bg-primary text-primary-foreground"
        )}
      >
        {children}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={8}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={100}>
      <div
        className={cn(
          "border border-input rounded-md bg-background",
          className
        )}
      >
        {/* Enhanced Toolbar */}
        <div className="border-b border-border p-2 flex flex-wrap gap-1 bg-muted/50">
          {/* Text Formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            disabled={disabled}
            tooltip="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            disabled={disabled}
            tooltip="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            disabled={disabled}
            tooltip="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            disabled={disabled}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            disabled={disabled}
            tooltip="Highlight text"
          >
            <Highlighter className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Headings */}
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            disabled={disabled}
            tooltip="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            tooltip="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            disabled={disabled}
            tooltip="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Text Alignment */}
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            tooltip="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            tooltip="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            tooltip="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            disabled={disabled}
            tooltip="Justify text"
          >
            <AlignJustify className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            disabled={disabled}
            tooltip="Bullet list"
          >
            <List className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            disabled={disabled}
            tooltip="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Quote */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            disabled={disabled}
            tooltip="Quote block"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Horizontal Rule */}
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled}
            tooltip="Horizontal line"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>
        </div>

        {/* Editor Content */}
        <div className="relative">
          {(!value || value === "<p></p>") && (
            <div className="absolute top-3 left-3 text-muted-foreground pointer-events-none z-10">
              {placeholder}
            </div>
          )}
          <EditorContent
            editor={editor}
            className="[&_.ProseMirror]:whitespace-pre-line [&_br]:block [&_br]:my-0.5"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
