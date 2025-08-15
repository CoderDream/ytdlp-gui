import ClickableText from "@renderer/components/ui/clickable-text";
import { Tab, TabNavbar } from "@renderer/components/ui/responsive-tabs";
import { ScrollArea } from "@renderer/components/ui/scroll-area";
import SuspenseLoader from "@renderer/components/ui/suspense-loader";
import { cn } from "@renderer/lib/utils";
import config, { NodeEnv } from "@shared/config";
import { Fragment, Suspense, createElement, useMemo } from "react";
import { toast } from "sonner";
import StatusBar from "./components/status-bar";
import { getSectionContentByTitle, getSectionMetaByTitle, sectionTabs, useSelectedTabTitle } from "./index.store";

export default function SettingsWindow() {
	const [selectedTab, setSelectedTab] = useSelectedTabTitle();
	const selectedContent = useMemo(() => (selectedTab && createElement(getSectionContentByTitle(selectedTab) as any)) || null, [selectedTab]);
	const selectedMeta = useMemo(() => (selectedTab && (getSectionMetaByTitle(selectedTab) as any)) || null, [selectedTab]);
	const buildInfo = useMemo(() => config.git?.shortHash && `${config.git.shortHash}`, []);
	const appVersion = useMemo(() => `v${window.api.version}`, []);
	const ContentLayout: typeof ScrollArea = useMemo(
		() => (selectedMeta?.customLayout ? ((({ children }: any) => <Fragment>{children}</Fragment>) as any) : ScrollArea),
		[selectedMeta],
	);
	return (
		<div className={cn("absolute inset-0 flex flex-col px-0 h-full")}>
			<div className='flex flex-col flex-shrink-0 h-full flex-auto'>
				<div className='grid grid-cols-[148px_1fr] h-full flex-auto overflow-hidden'>
					<TabNavbar
						defaultTab={selectedTab}
						onValueChange={setSelectedTab}
						orientation='vertical'
						indicatorPosition='right'
						className='h-full bg-background-2 pt-16 pb-6 relative'>
						{sectionTabs.map(({ title, icon: Icon }) => {
							return (
								<Tab value={title!} key={title}>
									<div className='flex items-center flex-row-reverse gap-x-2'>
										{Icon && <Icon className='size-4' />}
										<div>{title}</div>
									</div>
								</Tab>
							);
						})}
						<div className='flex-auto'></div>
						<div className='flex flex-col text-xs text-muted-foreground px-2 items-end flex-shrink-0'>
							<div>{config.appInfo.name}</div>
							<ClickableText
								onClick={() => navigator.clipboard.writeText(appVersion + ((buildInfo && ` b${buildInfo}`) || "")).then(() => toast("Copied app version"))}>
								{appVersion}
							</ClickableText>
							{buildInfo && (
								<ClickableText onClick={() => navigator.clipboard.writeText(buildInfo).then(() => toast("Copied build identifier"))}>{buildInfo}</ClickableText>
							)}
							<span>{NodeEnv}</span>
						</div>
					</TabNavbar>
					<ContentLayout className={cn("relative h-full", !selectedMeta?.plain && "px-6")}>
						{selectedContent ? (
							<Suspense fallback={<SuspenseLoader />}>{selectedContent}</Suspense>
						) : (
							<div className='flex flex-col items-center justify-center h-20'>Nothing here ?.?</div>
						)}
					</ContentLayout>
				</div>
				<StatusBar />
			</div>
		</div>
	);
}
