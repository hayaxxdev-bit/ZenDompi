import {
  createCategory as dbCreateCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  listCategories as dbListCategories,
} from "@zendompi/database";
import { CoreError } from "../errors";

export type CreateCategoryCommand = {
  userId: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  icon?: string;
};

export type UpdateCategoryCommand = {
  categoryId: string;
  userId: string;
  name?: string;
  icon?: string;
};

export class CategoryService {
  async create(cmd: CreateCategoryCommand) {
    if (!cmd.name || cmd.name.trim().length < 1) {
      throw new CoreError("Nama kategori tidak boleh kosong", "INVALID_NAME", 400);
    }

    try {
      return await dbCreateCategory({
        userId: cmd.userId,
        name: cmd.name.trim(),
        type: cmd.type,
        icon: cmd.icon,
      });
    } catch (error: any) {
      if (error.message?.includes("sudah ada")) {
        throw new CoreError(error.message, "DUPLICATE_CATEGORY", 409);
      }
      throw error;
    }
  }

  async update(cmd: UpdateCategoryCommand) {
    return dbUpdateCategory({
      categoryId: cmd.categoryId,
      userId: cmd.userId,
      name: cmd.name,
      icon: cmd.icon,
    });
  }

  async delete(categoryId: string, userId: string) {
    await dbDeleteCategory(categoryId, userId);
    return { success: true };
  }

  async list(userId: string, type?: "INCOME" | "EXPENSE" | "TRANSFER") {
    return dbListCategories(userId, type);
  }
}

export const categoryService = new CategoryService();