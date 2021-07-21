CREATE TABLE "public"."visite_lab_test"("lab_test_id" uuid NOT NULL, "visite_id" uuid NOT NULL, PRIMARY KEY ("lab_test_id","visite_id") , FOREIGN KEY ("lab_test_id") REFERENCES "public"."lab_test"("id") ON UPDATE cascade ON DELETE cascade, FOREIGN KEY ("visite_id") REFERENCES "public"."visite"("id") ON UPDATE cascade ON DELETE cascade);
