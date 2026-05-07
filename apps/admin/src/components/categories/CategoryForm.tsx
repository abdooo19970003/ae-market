'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth.provider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { CategoryFormData, CategoryAttribute } from '@/lib/types/category'
import { AttributesTable } from './AttributesTable'
import AttributeModal from './AttributeModal'
import {
  createCategoryWithAttributesAction,
  updateCategoryAction,
  getCategoryById,
} from '@/lib/actions/categories'

interface CategoryFormProps {
  // If provided, form is in edit mode
  initialData?: CategoryFormData & { id: number }
  parentId?: number
}

export function CategoryForm({ initialData, parentId }: CategoryFormProps) {
  const router = useRouter()
  const { user } = useAuth()
  const isEditMode = !!initialData

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || {
      name: '',
      slug: '',
      parentId: parentId || null,
      description: '',
      imageUrl: '',
      sortOrder: 0,
      attributes: [],
    },
  )

  const [showAttributeModal, setShowAttributeModal] = useState(false)
  const [editingAttributeId, setEditingAttributeId] = useState<
    string | number | null
  >(null)

  // ─────────────────────────────────────────────
  // Slug auto-generation
  // ─────────────────────────────────────────────
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [])

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Only auto-generate slug if not in edit mode or if slug matches old name pattern
      slug: !isEditMode ? generateSlug(name) : prev.slug,
    }))
  }

  // ─────────────────────────────────────────────
  // Attribute management
  // ─────────────────────────────────────────────
  const addAttribute = () => {
    setEditingAttributeId(null)
    setShowAttributeModal(true)
  }

  const editAttribute = (id: string | number) => {
    setEditingAttributeId(id)
    setShowAttributeModal(true)
  }

  const saveAttribute = (attribute: CategoryAttribute) => {
    if (editingAttributeId !== null) {
      // Edit mode
      setFormData((prev) => ({
        ...prev,
        attributes: prev.attributes.map((attr) =>
          attr.id === editingAttributeId ? { ...attr, ...attribute } : attr,
        ),
      }))
    } else {
      // Add mode
      const newAttr: CategoryAttribute = {
        id: `temp-${Date.now()}`,
        ...attribute,
      }
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, newAttr],
      }))
    }
    setShowAttributeModal(false)
  }

  const deleteAttribute = (id: string | number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((attr) => attr.id !== id),
    }))
  }

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (!user) throw new Error('Not authenticated')

      // Validate
      if (!formData.name || !formData.slug) {
        throw new Error('Name and slug are required')
      }

      let result

      if (isEditMode && initialData?.id) {
        // Update mode
        result = await updateCategoryAction({
          ...formData,
          id: String(initialData.id),
        })
      } else {
        // Create mode
        result = await createCategoryWithAttributesAction(formData)
      }

      if (!result.success) {
        throw new Error(result.error)
      }

      setSuccess('Category saved successfully!')

      if (result.warnings?.length) {
        setError(`Saved with warnings: ${result.warnings.join('; ')}`)
      }

      setTimeout(() => {
        router.push(`/dashboard/categories/${result.categoryId}`)
        router.refresh()
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const editingAttribute = formData.attributes.find(
    (attr) => attr.id === editingAttributeId,
  )

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className='max-w-4xl mx-auto space-y-6 py-6'
    >
      <div>
        <h1 className='text-3xl font-bold'>
          {isEditMode ? 'Edit Category' : 'Create Category'}
        </h1>
        <p className='text-gray-600 mt-2'>
          {isEditMode
            ? 'Update category details and manage its attributes'
            : 'Add a new category with attributes and options'}
        </p>
      </div>

      {error && (
        <Alert variant={success ? 'default' : 'destructive'}>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className='bg-green-50 border-green-200'>
          <AlertCircle className='h-4 w-4 text-green-600' />
          <AlertDescription className='text-green-800'>
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Category Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
          <CardDescription>Basic details about the category</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder='e.g. Smartphones'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug *</Label>
              <Input
                id='slug'
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
                placeholder='e.g. smartphones'
                className='font-mono text-sm'
              />
              <p className='text-xs text-gray-500'>URL-friendly identifier</p>
            </div>

            <div className='col-span-2 space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Detailed description of the category'
                rows={3}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='imageUrl'>Image URL</Label>
              <Input
                id='imageUrl'
                type='url'
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))
                }
                placeholder='https://...'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='sortOrder'>Sort Order</Label>
              <Input
                id='sortOrder'
                type='number'
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sortOrder: Number(e.target.value),
                  }))
                }
                min='0'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attributes Card */}
      <Card>
        <CardHeader>
          <CardTitle>Attributes</CardTitle>
          <CardDescription>
            Define attributes that products in this category will have
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttributesTable
            attributes={formData.attributes}
            onAddAttribute={addAttribute}
            onEditAttribute={editAttribute}
            onDeleteAttribute={deleteAttribute}
          />
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className='flex gap-3 justify-end'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={isLoading}
          size='lg'
        >
          {isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
          {isEditMode ? 'Update Category' : 'Create Category'}
        </Button>
      </div>

      {/* Attribute Modal */}
      <AttributeModal
        open={showAttributeModal}
        onOpenChange={setShowAttributeModal}
        attribute={editingAttribute}
        onSave={saveAttribute}
      />
    </form>
  )
}
