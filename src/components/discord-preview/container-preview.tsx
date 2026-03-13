import { ButtonPreview, type DiscordButtonStyle } from "@/components/discord-preview/button-preview";
import { DiscordMarkdown } from "@/components/discord-preview/discord-markdown";
import { cn } from "@/lib/utils";

interface DiscordButtonComponent {
  type: "button";
  label: string;
  style: DiscordButtonStyle;
  emoji?: string;
  disabled?: boolean;
}

interface DiscordSelectComponent {
  type: "select";
  placeholder?: string;
  disabled?: boolean;
}

interface DiscordTextDisplayComponent {
  type: "text_display";
  content: string;
}

interface DiscordSectionComponent {
  type: "section";
  text: string;
}

interface DiscordSeparatorComponent {
  type: "separator";
}

interface DiscordMediaGalleryComponent {
  type: "media_gallery";
  items: Array<{ url: string }>;
}

interface DiscordActionRowComponent {
  type: "action_row";
  components: Array<DiscordButtonComponent | DiscordSelectComponent>;
}

export type DiscordContainerComponent =
  | DiscordActionRowComponent
  | DiscordButtonComponent
  | DiscordSelectComponent
  | DiscordTextDisplayComponent
  | DiscordSectionComponent
  | DiscordSeparatorComponent
  | DiscordMediaGalleryComponent;

export interface ContainerData {
  components: DiscordContainerComponent[];
}

interface ContainerPreviewProps {
  container?: ContainerData;
  components?: DiscordContainerComponent[];
  accentColor?: string;
  className?: string;
}

function renderActionItem(component: DiscordButtonComponent | DiscordSelectComponent, key: string) {
  if (component.type === "button") {
    return <ButtonPreview key={key} label={component.label} style={component.style} emoji={component.emoji} disabled={component.disabled} />;
  }

  return (
    <button
      key={key}
      type="button"
      disabled={component.disabled}
      className={cn(
        "inline-flex min-h-[32px] min-w-[180px] items-center justify-between rounded-[4px] border border-[#1e1f22] bg-[#1f2124]",
        "px-[10px] text-[14px] font-medium text-[#dbdee1]",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif]",
        component.disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="truncate text-[#b5bac1]">{component.placeholder ?? "Select an option"}</span>
      <span className="ml-2 text-[#b5bac1]">▾</span>
    </button>
  );
}

export function ContainerPreview({ container, components, accentColor, className }: ContainerPreviewProps) {
  const items = container?.components ?? components ?? [];

  return (
    <div
      className={cn(
        "w-full rounded-[8px] border border-[#1e1f22] bg-[#2b2d31] p-[12px]",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif]",
        className
      )}
      style={accentColor ? { boxShadow: `inset 4px 0 0 ${accentColor}` } : undefined}
    >
      <div className="space-y-[10px]">
        {items.map((component, index) => {
          if (component.type === "action_row") {
            return (
              <div key={`row-${index}`} className="flex flex-wrap gap-[8px]">
                {component.components.map((child, childIndex) =>
                  renderActionItem(child, `row-${index}-item-${childIndex}`)
                )}
              </div>
            );
          }

          if (component.type === "button" || component.type === "select") {
            return (
              <div key={`single-${index}`} className="flex flex-wrap gap-[8px]">
                {renderActionItem(component, `single-${index}`)}
              </div>
            );
          }

          if (component.type === "text_display") {
            return (
              <div key={`text-${index}`} className="text-[14px] leading-[1.375] text-[#dbdee1]">
                <DiscordMarkdown content={component.content} />
              </div>
            );
          }

          if (component.type === "section") {
            return (
              <div key={`section-${index}`} className="rounded-[4px] bg-[#232428] p-[8px_10px] text-[14px] text-[#dbdee1]">
                <DiscordMarkdown content={component.text} />
              </div>
            );
          }

          if (component.type === "separator") {
            return <div key={`sep-${index}`} className="h-px bg-[#3f4147]" />;
          }

          if (component.type === "media_gallery") {
            return (
              <div key={`media-${index}`} className="grid grid-cols-2 gap-[8px]">
                {component.items.map((item, itemIndex) => (
                  <img
                    key={`media-${index}-${itemIndex}`}
                    src={item.url}
                    alt=""
                    className="h-[110px] w-full rounded-[4px] border border-[#202225] object-cover"
                  />
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
