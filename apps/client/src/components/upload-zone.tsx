'use client'
import { initializeSubmission } from '@/actions/initialize-submission'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@vimmer/ui/components/button'
import { Form, FormField } from '@vimmer/ui/components/form'
import { cn } from '@vimmer/ui/lib/utils'
import { useAction } from 'next-safe-action/hooks'
import Dropzone from 'react-dropzone'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

const FileUploadSchema = z.object({
  files: z.array(z.object({ data: z.any().refine(v => v instanceof File) })),
})

type FileUploadValues = z.infer<typeof FileUploadSchema>

export default function UploadZone() {
  const { execute, isExecuting, result, hasErrored } = useAction(initializeSubmission)
  const form = useForm<FileUploadValues>({
    resolver: zodResolver(FileUploadSchema),
    defaultValues: {
      files: [],
    },
  })

  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'files',
  })

  const onSubmit = () => {
    console.log('fields', fields)
    execute({ ref: '1232', competitionId: 1 })
  }

  return (
    <Form {...form}>
      <form action="" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 max-w-md space-y-5">
        <FormField
          control={form.control}
          name="files"
          render={() => (
            <Dropzone
              accept={{
                'image/*': ['.jpg', '.jpeg'],
              }}
              onDropAccepted={acceptedFiles => {
                acceptedFiles.map(acceptedFile => {
                  console.log('acceptedFile', acceptedFile)
                  return append({
                    data: acceptedFile,
                  })
                })
              }}
              multiple={true}
              maxSize={5000000}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps({
                    className: cn(
                      'p-3 mb-4 flex flex-col items-center justify-center w-full rounded-md cursor-pointer border border-[#e2e8f0]',
                    ),
                  })}
                >
                  <div className="flex items-center gap-x-3 mt-2 mb-2">
                    <label
                      onClick={e => e.preventDefault()}
                      className={`text-sm text-[7E8DA0] cursor-pointer focus:outline-none focus:underline ${
                        form.formState.errors.files && 'text-red-500'
                      }`}
                    >
                      Add your Product Images
                      <input {...getInputProps()} />
                    </label>
                  </div>
                </div>
              )}
            </Dropzone>
          )}
        />
        <Button type="submit" variant="default" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
