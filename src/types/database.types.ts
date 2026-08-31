/**
 * Tipos do banco de dados Supabase (schema `public`).
 * Espelha supabase/migrations/0001_init.sql. Quando o schema mudar,
 * regenere com `npx supabase gen types typescript` e ajuste manualmente
 * se preferir não depender da CLI.
 */

export type HomeSection = "mais_vendidos" | "novidades" | "ofertas";
export type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito" | "boleto";
export type PaymentStatus = "pendente" | "pago" | "falhou" | "reembolsado";
export type DeliveryStatus =
  | "recebido"
  | "preparando"
  | "enviado"
  | "entregue"
  | "cancelado";

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          icon: string | null;
          image_url: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["categories"]["Row"], "id" | "created_at">> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          code: string;
          description: string | null;
          brand: string | null;
          category_id: string | null;
          price: number;
          promo_price: number | null;
          stock: number;
          weight_grams: number;
          is_active: boolean;
          home_section: HomeSection | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "code" | "created_at" | "updated_at">
        > & {
          name: string;
          slug: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          display_order: number;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["product_images"]["Row"], "id">> & {
          product_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variations: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          value: string;
          stock: number;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["product_variations"]["Row"], "id">> & {
          product_id: string;
          label: string;
          value: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      banners: {
        Row: {
          id: string;
          title: string | null;
          description: string | null;
          image_url: string;
          button_label: string | null;
          button_link: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["banners"]["Row"], "id" | "created_at">> & {
          image_url: string;
        };
        Update: Partial<Database["public"]["Tables"]["banners"]["Insert"]>;
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          cpf: string | null;
          cep: string | null;
          street: string | null;
          address_number: string | null;
          complement: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          created_at: string;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at">> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          customer_name: string;
          email: string;
          phone: string;
          customer_id: string | null;
          shipping_address: ShippingAddress;
          subtotal: number;
          shipping_cost: number;
          total: number;
          shipping_method: string | null;
          tracking_code: string | null;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          delivery_status: DeliveryStatus;
          mercadopago_payment_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Omit<
            Database["public"]["Tables"]["orders"]["Row"],
            "id" | "order_number" | "created_at" | "updated_at"
          >
        > & {
          customer_name: string;
          email: string;
          phone: string;
          shipping_address: ShippingAddress;
          subtotal: number;
          total: number;
          payment_method: PaymentMethod;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          variation_label: string | null;
          variation_value: string | null;
        };
        Insert: Partial<Omit<Database["public"]["Tables"]["order_items"]["Row"], "id">> & {
          order_id: string;
          product_name: string;
          unit_price: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      home_section: HomeSection;
      payment_method: PaymentMethod;
      payment_status: PaymentStatus;
      delivery_status: DeliveryStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export interface ShippingAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type ProductVariation = Database["public"]["Tables"]["product_variations"]["Row"];
export type Banner = Database["public"]["Tables"]["banners"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type AdminProfile = Database["public"]["Tables"]["admin_profiles"]["Row"];

export type ProductWithRelations = Product & {
  product_images: ProductImage[];
  product_variations: ProductVariation[];
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};
