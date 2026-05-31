interface AuthHeaderProps {
  title: string;
  description?: React.ReactNode;
  align?: "left" | "center";
}

export function AuthHeader({
  title,
  description,
  align = "left",
}: AuthHeaderProps) {
  return (
    <div
      className={
        align === "center" ? "text-center space-y-2" : "space-y-1.5"
      }
    >
      <h1 className="text-2xl sm:text-[1.625rem] font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="text-sm sm:text-[0.9375rem] text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
