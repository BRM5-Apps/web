import { ButtonPreview, type DiscordButtonStyle } from "@/components/discord-preview/button-preview";
import { DiscordMarkdown } from "@/components/discord-preview/discord-markdown";
import { discordThemes, type DiscordTheme } from "@/components/discord-preview/discord-theme";
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
  discordTheme?: DiscordTheme;
  className?: string;
}

interface ActionItemTheme {
  selectBg: string;
  selectBorder: string;
  selectText: string;
  selectPlaceholder: string;
}

function renderActionItem(
  component: DiscordButtonComponent | DiscordSelectComponent,
  key: string,
  theme: ActionItemTheme
) {
  if (component.type === "button") {
    return <ButtonPreview key={key} label={component.label} style={component.style} emoji={component.emoji} disabled={component.disabled} />;
  }

  return (
    <button
      key={key}
      type="button"
      disabled={component.disabled}
      className={cn(
        "inline-flex min-h-[32px] min-w-[180px] items-center justify-between rounded-[4px]",
        "px-[10px] text-[14px] font-medium",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif]",
        component.disabled && "cursor-not-allowed opacity-50"
      )}
      style={{
        backgroundColor: theme.selectBg,
        borderColor: theme.selectBorder,
        borderWidth: "1px",
        borderStyle: "solid",
        color: theme.selectText,
      }}
    >
      <span className="truncate" style={{ color: theme.selectPlaceholder }}>{component.placeholder ?? "Select an option"}</span>
      <span className="ml-2" style={{ color: theme.selectPlaceholder }}>▾</span>
    </button>
  );
}

export function ContainerPreview({ container, components, accentColor, discordTheme = "dark", className }: ContainerPreviewProps) {
  const t = discordThemes[discordTheme];
  const items = container?.components ?? components ?? [];

  return (
    <div
      className={cn(
        "w-full rounded-[8px] p-[12px]",
        "font-['gg_sans','Whitney','Helvetica Neue',Helvetica,Arial,sans-serif]",
        className
      )}
      style={{
        backgroundColor: t.containerBg,
        borderColor: t.containerBorder,
        borderWidth: "1px",
        borderStyle: "solid",
        ...(accentColor ? { boxShadow: `inset 4px 0 0 ${accentColor}` } : {}),
      }}
    >
      <div className="space-y-[10px]">
        {items.map((component, index) => {
          if (component.type === "action_row") {
            return (
              <div key={`row-${index}`} className="flex flex-wrap gap-[8px]">
                {component.components.map((child, childIndex) =>
                  renderActionItem(child, `row-${index}-item-${childIndex}`, t)
                )}
              </div>
            );
          }

          if (component.type === "button" || component.type === "select") {
            return (
              <div key={`single-${index}`} className="flex flex-wrap gap-[8px]">
                {renderActionItem(component, `single-${index}`, t)}
              </div>
            );
          }

          if (component.type === "text_display") {
            return (
              <div key={`text-${index}`} className="text-[14px] leading-[1.375]" style={{ color: t.textPrimary }}>
                <DiscordMarkdown content={component.content} />
              </div>
            );
          }

          if (component.type === "section") {
            return (
              <div key={`section-${index}`} className="rounded-[4px] p-[8px_10px] text-[14px]" style={{ backgroundColor: t.sectionBg, color: t.textPrimary }}>
                <DiscordMarkdown content={component.text} />
              </div>
            );
          }

          if (component.type === "separator") {
            return <div key={`sep-${index}`} className="h-px" style={{ backgroundColor: t.separatorColor }} />;
          }

          if (component.type === "media_gallery") {
            return (
              <div key={`media-${index}`} className="grid grid-cols-2 gap-[8px]">
                {component.items.map((item, itemIndex) => (
                  <img
                    key={`media-${index}-${itemIndex}`}
                    src={item.url}
                    alt=""
                    className="h-[110px] w-full rounded-[4px] object-cover"
                    style={{ borderColor: t.embedBorder, borderWidth: "1px", borderStyle: "solid" }}
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
