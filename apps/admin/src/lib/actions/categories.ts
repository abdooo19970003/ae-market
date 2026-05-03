"use server"
import api from "@/lib/api";
import { toSnakeCase } from "@/lib/string";
import { CategoryFormData } from "../types/category";
import { cookies } from "next/headers";
import { API_BASE_URL } from "../auth/auth.types";

interface ActionResult<T = null> {
  success: boolean
  data?: T
  categoryId?: number
  error?: string
  warnings?: string[]
}

/**
 * Get access token from HTTP-only cookie
 */
async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('accessToken')?.value ?? null
}

export const getAllCategories = async (params: Record<string, any> = {}) => {
  params = { ...params, sort: `categories.${toSnakeCase(params.sort)}` }
  const { data } = await api.get("/categories", {
    params: { ...params, tree: "false" }
  });

  return data.data;
}

export const getCategoryById = async (id: string) => {
  const { data } = await api.get(`/categories/${id}`)
  return data.data
}

export const getCategoryChildren = async (id: string) => {
  const { data } = await api.get(`/categories/${id}/children`)
  return data.data
}

export const getCategoryProducts = async (id: string) => {
  const { data } = await api.get(`/categories/${id}/products?includeSubcategories=true`)
  return data.data
}

export async function createCategoryWithAttributesAction(
  formData: CategoryFormData
): Promise<ActionResult> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please log in.',
      }
    }

    // Validate input
    if (!formData.name || !formData.slug) {
      return {
        success: false,
        error: 'Name and slug are required',
      }
    }

    // ─────────────────────────────────────────────────────────
    // Step 1: Create category
    // ─────────────────────────────────────────────────────────
    const categoryRes = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: formData.name,
        slug: formData.slug,
        parentId: formData.parentId || null,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        sortOrder: formData.sortOrder || 0,
      }),
    })

    if (!categoryRes.ok) {
      const error = await categoryRes.json()
      return {
        success: false,
        error: error.error?.message || 'Failed to create category',
      }
    }

    const categoryResult = await categoryRes.json()
    console.log(categoryResult);
    const categoryId = categoryResult.data.data.id

    // ─────────────────────────────────────────────────────────
    // Step 2: Create attributes (collect errors but continue)
    // ─────────────────────────────────────────────────────────
    const attributeErrors: string[] = []

    for (const attr of formData.attributes) {
      try {
        const attrRes = await fetch(
          `${API_BASE_URL}/categories/${categoryId}/attributes`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              name: attr.name,
              slug: attr.slug,
              inputType: attr.inputType,
              unit: attr.unit || null,
              isRequired: attr.isRequired,
              isFilterable: attr.isFilterable,
              sortOrder: attr.sortOrder,
            }),
          }
        )

        if (!attrRes.ok) {
          const error = await attrRes.json()
          attributeErrors.push(
            `Attribute "${attr.name}": ${error.error?.message || 'Failed to create'}`
          )
          continue
        }

        const attrData = await attrRes.json()
        const attrId = attrData.data.data.id

        // ───────────────────────────────────────────────────────
        // Step 3: Create attribute options for select types
        // ───────────────────────────────────────────────────────
        if (
          attr.options?.length &&
          ['select', 'multi_select'].includes(attr.inputType)
        ) {
          for (const option of attr.options) {
            const optRes = await fetch(
              `${API_BASE_URL}/categories/${categoryId}/attributes/${attrId}/options`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  label: option.label,
                  value: option.value,
                  sortOrder: option.sortOrder || 0,
                }),
              }
            )

            if (!optRes.ok) {
              const error = await optRes.json()
              attributeErrors.push(
                `Option "${option.label}" in "${attr.name}": ${error.error?.message || 'Failed to create'}`
              )
            }
          }
        }
      } catch (err) {
        attributeErrors.push(
          `Attribute "${attr.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
        )
      }
    }

    // ─────────────────────────────────────────────────────────
    // Return result
    // ─────────────────────────────────────────────────────────
    return {
      success: true,
      categoryId,
      warnings: attributeErrors.length > 0 ? attributeErrors : undefined,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create category',
    }
  }
}


/**
 * Update an existing category and its attributes
 */
export async function updateCategoryAction(
  formData: CategoryFormData & { id: string }
): Promise<ActionResult> {
  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please log in.',
      }
    }

    if (!formData.id) {
      return {
        success: false,
        error: 'Category ID is required',
      }
    }

    if (!formData.name || !formData.slug) {
      return {
        success: false,
        error: 'Name and slug are required',
      }
    }

    const categoryId = Number(formData.id)

    // ─────────────────────────────────────────────────────────
    // Step 1: Update category basic info
    // ─────────────────────────────────────────────────────────
    const categoryRes = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: formData.name,
        slug: formData.slug,
        parentId: formData.parentId || null,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null,
        sortOrder: formData.sortOrder || 0,
      }),
    })

    if (!categoryRes.ok) {
      const error = await categoryRes.json()
      return {
        success: false,
        error: error.error?.message || 'Failed to update category',
      }
    }

    // ─────────────────────────────────────────────────────────
    // Step 2: Handle attributes (create new, update existing, delete removed)
    // ─────────────────────────────────────────────────────────
    const attributeErrors: string[] = []

    // Get existing attributes from API
    const existingAttrsRes = await fetch(
      `${API_BASE_URL}/categories/${categoryId}/attributes`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    let existingAttrs = []
    if (existingAttrsRes.ok) {
      const existingData = await existingAttrsRes.json()
      existingAttrs = existingData.data || []
    }

    // Create new attributes (those without ID or with temp ID)
    for (const attr of formData.attributes) {
      if (!attr.id || typeof attr.id === 'string') {
        // New attribute
        try {
          const attrRes = await fetch(
            `${API_BASE_URL}/categories/${categoryId}/attributes`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                name: attr.name,
                slug: attr.slug,
                inputType: attr.inputType,
                unit: attr.unit || null,
                isRequired: attr.isRequired,
                isFilterable: attr.isFilterable,
                sortOrder: attr.sortOrder,
              }),
            }
          )

          if (!attrRes.ok) {
            const error = await attrRes.json()
            attributeErrors.push(
              `Failed to create attribute "${attr.name}": ${error.error?.message}`
            )
            continue
          }

          const attrData = await attrRes.json()
          const attrId = attrData.data.id

          // Create options for new attribute
          if (
            attr.options?.length &&
            ['select', 'multi_select'].includes(attr.inputType)
          ) {
            for (const option of attr.options) {
              await fetch(
                `${API_BASE_URL}/categories/${categoryId}/attributes/${attrId}/options`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                  },
                  body: JSON.stringify({
                    label: option.label,
                    value: option.value,
                    sortOrder: option.sortOrder || 0,
                  }),
                }
              ).catch((err) => {
                attributeErrors.push(`Failed to create option "${option.label}": ${err.message}`)
              })
            }
          }
        } catch (err) {
          attributeErrors.push(
            `Error creating attribute "${attr.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
          )
        }
      } else {
        // Update existing attribute (currently API doesn't support PATCH for attributes)
        // So we would need to delete and recreate, or skip updates
        // For now, we'll just log that updates aren't supported
        console.log(`Note: Attribute ID ${attr.id} updates not yet implemented`)
      }
    }

    // Delete removed attributes
    const formAttrIds = formData.attributes
      .map((a) => a.id)
      .filter((id) => typeof id === 'number')

    for (const existingAttr of existingAttrs) {
      if (!formAttrIds.includes(existingAttr.id)) {
        try {
          await fetch(
            `${API_BASE_URL}/categories/${categoryId}/attributes/${existingAttr.id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          )
        } catch (err) {
          attributeErrors.push(
            `Failed to delete attribute "${existingAttr.name}": ${err instanceof Error ? err.message : 'Unknown error'}`
          )
        }
      }
    }

    // ─────────────────────────────────────────────────────────
    // Return result
    // ─────────────────────────────────────────────────────────
    return {
      success: true,
      categoryId,
      warnings: attributeErrors.length > 0 ? attributeErrors : undefined,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update category',
    }
  }
}
export async function deleteCategoryAction(id: string) { }
