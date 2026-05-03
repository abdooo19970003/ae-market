import {
  AttributeOption,
  CategoryAttribute,
  INPUT_TYPES,
} from '@/lib/types/category'
import { on } from 'events'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Plus, Trash2 } from 'lucide-react'
;`use client`

interface AttributeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attribute?: CategoryAttribute
  onSave: (attribute: CategoryAttribute) => void
}

const AttributeModal = ({
  open,
  onOpenChange,
  attribute,
  onSave,
}: AttributeModalProps) => {
  const [formData, setFormData] = useState<CategoryAttribute>(
    attribute || {
      name: '',
      slug: '',
      inputType: 'text',
      unit: '',
      isRequired: false,
      isFilterable: false,
      sortOrder: 0,
      options: [],
    },
  )

  const [newOption, setNewOption] = useState<{
    label: string
    value: string
  }>({ label: '', value: '' })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (attribute) {
      setFormData(attribute)
    }
  }, [attribute, open])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: !attribute ? generateSlug(name) : prev.slug,
    }))
  }

  const addOption = () => {
    if (!newOption.label || !newOption.value) {
      setErrors({ ...errors, option: 'Option label and value are required' })
      return
    }

    const attributeOption: AttributeOption = {
      ...newOption,
      sortOrder: formData.options?.length || 0,
    }
    setFormData((prev) => ({
      ...prev,
      options: [...(prev.options || []), attributeOption],
    }))
    setNewOption({ label: '', value: '' })
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy.option
      return copy
    })
  }

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }))
  }

  const handleSave = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required'
    }
    if (!formData.slug || formData.slug.trim() === '') {
      newErrors.slug = 'Slug is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
    onOpenChange(false)
  }

  const isSelectType = ['select', 'multi_select'].includes(formData.inputType)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {attribute ? 'Edit Attribute' : 'Add Attribute'}
          </DialogTitle>
          <DialogDescription>
            Define the attribute details and options if applicable.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder='e.g. RAM'
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className='text-red-500 text-sm'>{errors.name}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='slug'>Slug *</Label>
              <Input
                id='slug'
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder='e.g. ram'
                className={cn(
                  'font-mono text-sm',
                  errors.slug && 'border-red-500',
                )}
              />
              {errors.slug && (
                <p className='text-red-500 text-sm'>{errors.slug}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='inputType'>Input Type *</Label>
              <Select
                value={formData.inputType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    inputType: value as CategoryAttribute['inputType'],
                  }))
                }
              >
                <SelectTrigger id='inputType'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPES.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                    >
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='unit'>Unit</Label>
              <Input
                id='unit'
                value={formData.unit || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder='e.g. GB, cm, Kg'
              />
            </div>
          </div>

          {/* CheckBoxes */}
          <div className='flex gap-6 '>
            <Label className='flex items-center gap-2 cursor-pointer'>
              <Checkbox
                checked={formData.isRequired}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isRequired: checked === true,
                  }))
                }
              />
              <span className='text-sm'>Required</span>{' '}
            </Label>
            <Label className='flex items-center gap-2 cursor-pointer'>
              <Checkbox
                checked={formData.isFilterable}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isFilterable: checked === true,
                  }))
                }
              />
              <span className='text-sm'>Filterable</span>{' '}
            </Label>
          </div>

          {/* Options - for Select Types*/}
          {isSelectType && (
            <div className='space-y-3 border-t pt-4'>
              <h4 className='font-medium'>Options</h4>
              {/* options table */}
              {formData.options && formData.options?.length > 0 && (
                <div className='border-rounder'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className='w-10'></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.options.map((option, index) => (
                        <TableRow key={index}>
                          <TableCell className='font-medium'>
                            {option.label}
                          </TableCell>
                          <TableCell className='bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs'>
                            <code>{option.value}</code>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={'destructive'}
                              size={'sm'}
                              onClick={() => {
                                removeOption(index)
                              }}
                              className='h-6 w-6 p-0'
                            >
                              <Trash2 />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {/* new Option */}
              <div className='space-y-2 bg-gray-50 dark:bg-gray-800 p-3 rounded'>
                <div className='grid grid-cols-2 gap-2'>
                  <Input
                    placeholder='Label (e.g., 128 GB)'
                    value={newOption.label}
                    onChange={(e) =>
                      setNewOption((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder='Value (e.g., 128)'
                    value={newOption.value}
                    onChange={(e) =>
                      setNewOption((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                  />
                </div>
                {errors.option && (
                  <p className='text-red-500 text-sm'>{errors.option}</p>
                )}
                <Button
                  onClick={addOption}
                  variant='outline'
                  size='sm'
                  className='w-full'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {attribute ? 'Update' : 'Add'} Attribute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AttributeModal
