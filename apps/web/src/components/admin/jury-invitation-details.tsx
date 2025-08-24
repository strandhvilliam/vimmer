"use client"

import React from "react"
import { RefreshCw, Trash2, Mail, Users, Star, BarChart3 } from "lucide-react"
import { Button } from "@vimmer/ui/components/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@vimmer/ui/components/alert-dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@vimmer/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@vimmer/ui/components/table"
import { toast } from "@vimmer/ui/hooks/use-toast"
import { useDomain } from "@/contexts/domain-context"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { JuryStatusBadge } from "@/components/admin/jury-status-badge"
import { JuryInvitationNotFound } from "@/components/admin/jury-invitation-not-found"
import { format } from "date-fns"

interface JuryInvitationDetailsProps {
  invitationId: number
}

export function JuryInvitationDetails({
  invitationId,
}: JuryInvitationDetailsProps) {
  return <div>Not implemented</div>
}
//   const trpc = useTRPC();
//   const queryClient = useQueryClient();
//   const { domain } = useDomain();

//   const { data: invitation } = useSuspenseQuery(
//     trpc.jury.getJuryInvitationById.queryOptions({
//       id: invitationId,
//     }),
//   );
//   const { data: competitionClasses } = useSuspenseQuery(
//     trpc.competitionClasses.getByDomain.queryOptions({
//       domain,
//     }),
//   );
//   const { data: topics } = useSuspenseQuery(
//     trpc.topics.getByDomain.queryOptions({
//       domain,
//     }),
//   );
//   const { data: deviceGroups } = useSuspenseQuery(
//     trpc.deviceGroups.getByDomain.queryOptions({
//       domain,
//     }),
//   );

//   // Get participants and ratings data for this jury member
//   const { data: participantsData } = useSuspenseQuery(
//     trpc.jury.getParticipants.queryOptions({
//       token: invitation?.token || "",
//     }),
//   );

//   const { mutate: deleteInvitation, isPending: isDeleting } = useMutation(
//     trpc.jury.deleteJuryInvitation.mutationOptions({
//       onSuccess: () => {
//         toast({
//           title: "Invitation deleted",
//           description: "Jury invitation has been deleted successfully",
//         });
//       },
//       onError: (error) => {
//         console.log("error", error);
//         toast({
//           title: "Error",
//           description: error.message || "Failed to delete invitation",
//           variant: "destructive",
//         });
//       },
//       onSettled: () => {
//         queryClient.invalidateQueries({
//           queryKey: trpc.jury.pathKey(),
//         });
//       },
//     }),
//   );

//   const handleResendInvitation = () => {
//     toast({
//       title: "Not implemented",
//       description: `Jury invitation resend is not implemented yet`,
//     });
//   };

//   const handleDeleteInvitation = () => {
//     deleteInvitation({ id: invitationId });
//   };

//   const className = competitionClasses.find(
//     (c) => c.id === invitation?.competitionClassId,
//   );
//   const deviceGroup = deviceGroups.find(
//     (g) => g.id === invitation?.deviceGroupId,
//   );
//   const topic = topics.find((t) => t.id === invitation?.topicId);

//   if (!invitation) {
//     return <JuryInvitationNotFound />;
//   }

//   const { participants, ratings } = participantsData;
//   const totalParticipants = participants.length;
//   const ratedParticipants = ratings.length;
//   const progressPercentage =
//     totalParticipants > 0 ? (ratedParticipants / totalParticipants) * 100 : 0;

//   // Calculate rating distribution
//   const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
//     rating,
//     count: ratings.filter((r) => r.rating === rating).length,
//   }));

//   const averageRating =
//     ratings.length > 0
//       ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
//       : 0;

//   return (
//     <div className="container mx-auto py-6 space-y-6 overflow-y-auto">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold font-rocgrotesk">Jury Invitation</h1>
//         <div className="space-x-2">
//           <Button variant="outline" size="sm" onClick={handleResendInvitation}>
//             <RefreshCw className="h-4 w-4 mr-2" />
//             Resend
//           </Button>
//           <AlertDialog>
//             <AlertDialogTrigger asChild>
//               <Button variant="destructive" size="sm" disabled={isDeleting}>
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 {isDeleting ? "Deleting..." : "Delete"}
//               </Button>
//             </AlertDialogTrigger>
//             <AlertDialogContent>
//               <AlertDialogHeader>
//                 <AlertDialogTitle>Delete Jury Invitation</AlertDialogTitle>
//                 <AlertDialogDescription>
//                   Are you sure you want to delete the jury invitation for{" "}
//                   {invitation.email}? This action cannot be undone.
//                 </AlertDialogDescription>
//               </AlertDialogHeader>
//               <AlertDialogFooter>
//                 <AlertDialogCancel>Cancel</AlertDialogCancel>
//                 <AlertDialogAction
//                   onClick={handleDeleteInvitation}
//                   className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                 >
//                   Delete
//                 </AlertDialogAction>
//               </AlertDialogFooter>
//             </AlertDialogContent>
//           </AlertDialog>
//         </div>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center">
//             <Mail className="h-5 w-5 mr-2" />
//             {invitation.email}
//           </CardTitle>
//           <CardDescription>
//             Invitation sent on{" "}
//             {new Date(invitation.createdAt).toLocaleDateString()}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-sm font-medium text-muted-foreground mb-2">
//                 Status
//               </h3>
//               <JuryStatusBadge status={invitation.status} />
//             </div>

//             <div>
//               <h3 className="text-sm font-medium text-muted-foreground mb-2">
//                 Expiration
//               </h3>
//               <p>{new Date(invitation.expiresAt).toLocaleDateString()}</p>
//             </div>

//             {invitation.notes && (
//               <div>
//                 <h3 className="text-sm font-medium text-muted-foreground mb-2">
//                   Notes
//                 </h3>
//                 <p className="text-sm">{invitation.notes}</p>
//               </div>
//             )}

//             <div>
//               <h3 className="text-sm font-medium text-muted-foreground mb-2">
//                 Submission Filters
//               </h3>
//               <Table>
//                 <TableBody>
//                   <TableRow>
//                     <TableCell className="font-medium">
//                       Competition Class
//                     </TableCell>
//                     <TableCell>{className?.name}</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell className="font-medium">Device Group</TableCell>
//                     <TableCell>{deviceGroup?.name}</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell className="font-medium">Topic</TableCell>
//                     <TableCell>{topic?.name}</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter>
//           <div className="text-sm text-muted-foreground">
//             Token:{" "}
//             <code className="bg-muted p-1 rounded">
//               {invitation.token.substring(0, 16)}...
//             </code>
//           </div>
//         </CardFooter>
//       </Card>

//       {/* Jury Progress Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Participants
//             </CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalParticipants}</div>
//             <p className="text-xs text-muted-foreground">
//               Available for review
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Ratings Given</CardTitle>
//             <Star className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{ratedParticipants}</div>
//             <p className="text-xs text-muted-foreground">
//               {progressPercentage.toFixed(1)}% complete
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Average Rating
//             </CardTitle>
//             <BarChart3 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {averageRating > 0 ? averageRating.toFixed(1) : "—"}
//             </div>
//             <div className="flex items-center mt-1">
//               {averageRating > 0 &&
//                 [1, 2, 3, 4, 5].map((star) => (
//                   <Star
//                     key={star}
//                     className={`h-3 w-3 ${
//                       star <= Math.round(averageRating)
//                         ? "fill-yellow-400 text-yellow-400"
//                         : "text-neutral-300"
//                     }`}
//                   />
//                 ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Rating Distribution */}
//       {ratings.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Rating Distribution</CardTitle>
//             <CardDescription>
//               How this jury member has rated participants
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-3">
//               {ratingDistribution.map(({ rating, count }) => (
//                 <div key={rating} className="flex items-center gap-3">
//                   <div className="flex items-center gap-1 w-16">
//                     <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
//                     <span className="text-sm font-medium">{rating}</span>
//                   </div>
//                   <div className="flex-1 bg-muted rounded-full h-2">
//                     <div
//                       className="bg-primary h-2 rounded-full transition-all"
//                       style={{
//                         width: `${ratings.length > 0 ? (count / ratings.length) * 100 : 0}%`,
//                       }}
//                     />
//                   </div>
//                   <span className="text-sm text-muted-foreground w-12 text-right">
//                     {count}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Recent Ratings */}
//       {ratings.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Ratings</CardTitle>
//             <CardDescription>
//               Latest ratings given by this jury member
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {ratings
//                 .sort(
//                   (a, b) =>
//                     new Date(b.createdAt).getTime() -
//                     new Date(a.createdAt).getTime(),
//                 )
//                 .slice(0, 5)
//                 .map((rating) => {
//                   const participant = participants.find(
//                     (p) => p.id === rating.participantId,
//                   );
//                   return (
//                     <div
//                       key={rating.id}
//                       className="flex items-center justify-between p-3 border rounded-lg"
//                     >
//                       <div className="flex items-center gap-3">
//                         <div className="flex items-center gap-1">
//                           {[1, 2, 3, 4, 5].map((star) => (
//                             <Star
//                               key={star}
//                               className={`h-3 w-3 ${
//                                 star <= rating.rating
//                                   ? "fill-yellow-400 text-yellow-400"
//                                   : "text-neutral-300"
//                               }`}
//                             />
//                           ))}
//                         </div>
//                         <div>
//                           <p className="font-medium">
//                             {participant?.reference ||
//                               `Participant ${rating.participantId}`}
//                           </p>
//                           <p className="text-sm text-muted-foreground">
//                             {participant?.firstname} {participant?.lastname}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-muted-foreground">
//                           {format(new Date(rating.createdAt), "PPpp")}
//                         </p>
//                         {rating.notes && (
//                           <p className="text-xs text-muted-foreground max-w-xs truncate">
//                             {rating.notes}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
