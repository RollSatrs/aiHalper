import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { users } from './schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

  console.log('🌱 Начало заполнения базы данных...');

  try {
    // Хешируем пароли
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const operator1Password = await bcrypt.hash('operator1', saltRounds);
    const operator2Password = await bcrypt.hash('operator2', saltRounds);

    // Проверяем, существует ли уже оператор
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@admin.com'))
      .limit(1);

    if (existingAdmin.length === 0) {
      // Создаем администратора
      await db.insert(users).values({
        name: 'Администратор',
        email: 'admin@admin.com',
        password: adminPassword,
        role: 'operator',
      });
      console.log('✅ Создан администратор: admin@admin.com / admin123');
    } else {
      console.log('ℹ️  Администратор уже существует: admin@admin.com');
    }

    // Проверяем, существует ли оператор 1
    const existingOp1 = await db
      .select()
      .from(users)
      .where(eq(users.email, 'operator1@example.com'))
      .limit(1);

    if (existingOp1.length === 0) {
      // Создаем оператора 1
      await db.insert(users).values({
        name: 'Оператор 1',
        email: 'operator1@example.com',
        password: operator1Password,
        role: 'operator',
      });
      console.log('✅ Создан оператор: operator1@example.com / operator1');
    } else {
      console.log('ℹ️  Оператор уже существует: operator1@example.com');
    }

    // Проверяем, существует ли оператор 2
    const existingOp2 = await db
      .select()
      .from(users)
      .where(eq(users.email, 'operator2@example.com'))
      .limit(1);

    if (existingOp2.length === 0) {
      // Создаем оператора 2
      await db.insert(users).values({
        name: 'Оператор 2',
        email: 'operator2@example.com',
        password: operator2Password,
        role: 'operator',
      });
      console.log('✅ Создан оператор: operator2@example.com / operator2');
    } else {
      console.log('ℹ️  Оператор уже существует: operator2@example.com');
    }

    console.log('');
    console.log('🎉 Заполнение базы данных завершено!');
    console.log('');
    console.log('📋 Учетные данные для входа:');
    console.log('  1. admin@admin.com / admin123');
    console.log('  2. operator1@example.com / operator1');
    console.log('  3. operator2@example.com / operator2');
    console.log('');
    console.log('🔗 Админ-панель: http://localhost:5173/admin');

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Запускаем seed
seed()
  .then(() => {
    console.log('✅ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  });

