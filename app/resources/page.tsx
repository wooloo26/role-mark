"use client";

import {
	File,
	FileAudio,
	FileImage,
	FileVideo,
	Loader2,
	Plus,
	Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";

function getFileIcon(mimeType: string) {
	if (mimeType.startsWith("image/")) return FileImage;
	if (mimeType.startsWith("video/")) return FileVideo;
	if (mimeType.startsWith("audio/")) return FileAudio;
	return File;
}

export default function ResourcesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data, isLoading } = trpc.resource.search.useQuery({
		title: searchQuery,
		limit: 50,
	});

	const resources = data?.resources ?? [];

	return (
		<div className="container py-8">
			<div className="flex flex-col gap-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Resources</h1>
						<p className="text-muted-foreground">
							Browse and manage your resource library
						</p>
					</div>
					<Button asChild>
						<Link href="/resources/new">
							<Plus className="mr-2 h-4 w-4" />
							Add Resource
						</Link>
					</Button>
				</div>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search resources..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				{/* Resource Grid */}
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{resources.map((resource) => {
							const FileIcon = getFileIcon(resource.mimeType);
							const isImage = resource.mimeType.startsWith("image/");

							return (
								<Link
									key={resource.id}
									href={`/resources/${resource.id}`}
									className="group"
								>
									<Card className="overflow-hidden transition-shadow hover:shadow-lg">
										<div className="aspect-square relative bg-muted">
											{isImage ? (
												<Image
													src={resource.fileUrl}
													alt={resource.title}
													fill
													className="object-cover group-hover:scale-105 transition-transform"
												/>
											) : (
												<div className="flex items-center justify-center h-full">
													<FileIcon className="h-16 w-16 text-muted-foreground" />
												</div>
											)}
										</div>
										<CardHeader>
											<CardTitle className="line-clamp-1">
												{resource.title}
											</CardTitle>
											<CardDescription className="text-xs">
												{resource.mimeType}
											</CardDescription>
										</CardHeader>
										{resource.dynamicTags &&
											resource.dynamicTags.length > 0 && (
												<CardContent>
													<div className="flex flex-wrap gap-1">
														{resource.dynamicTags
															.slice(0, 3)
															.map((tag: string) => (
																<Badge
																	key={tag}
																	variant="secondary"
																	className="text-xs"
																>
																	{tag}
																</Badge>
															))}
														{resource.dynamicTags.length > 3 && (
															<Badge variant="outline" className="text-xs">
																+{resource.dynamicTags.length - 3}
															</Badge>
														)}
													</div>
												</CardContent>
											)}
									</Card>
								</Link>
							);
						})}
					</div>
				)}

				{!isLoading && resources.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<p className="text-lg text-muted-foreground mb-4">
							{searchQuery
								? "No resources found matching your search"
								: "No resources yet"}
						</p>
						<Button asChild>
							<Link href="/resources/new">
								<Plus className="mr-2 h-4 w-4" />
								Upload your first resource
							</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
