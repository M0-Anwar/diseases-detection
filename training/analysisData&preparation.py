import pandas as pd
import numpy as np
import logging
from collections import defaultdict
import warnings
import os
warnings.filterwarnings('ignore')


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Step 1: Load and clean data
gwas_file = 'gwas_clean_data.csv'
logger.info(f"Loading data from {gwas_file}...")

try:
    df = pd.read_csv(gwas_file, low_memory=False)
    logger.info(f"Data loaded successfully. Shape: {df.shape}")
    logger.info(f"Columns: {list(df.columns)}")
except FileNotFoundError:
    logger.error(f"File {gwas_file} not found!")
    exit()

# Compute midpoint for EFFECT_SIZE_RANGE
def compute_midpoint(range_str):
    if pd.isna(range_str):
        return np.nan
    try:
        range_str = str(range_str).replace(' ', '').strip()
        parts = range_str.split('-')
        if len(parts) == 2:
            return (float(parts[0]) + float(parts[1])) / 2
        return np.nan
    except:
        return np.nan

df['EFFECT_MIDPOINT'] = df['EFFECT_SIZE_RANGE'].apply(compute_midpoint)

# Clean data
df_clean = df.dropna(subset=['EFFECT_MIDPOINT', 'RISK_ALLELE_FREQUENCY'])
df_clean = df_clean[['SNPS', 'MAPPED_GENE', 'RISK_ALLELE_FREQUENCY', 'EFFECT_MIDPOINT', 'DISEASE/TRAIT']]
logger.info(f" Cleaned data shape: {df_clean.shape}")

# Step 2: Analyze diseases
logger.info(" Analyzing diseases")

unique_diseases = df_clean['DISEASE/TRAIT'].unique()
logger.info(f"Total unique diseases: {len(unique_diseases)}")

logger.info("\nSample diseases (first 20):")
for i, disease in enumerate(unique_diseases[:20]):
    logger.info(f"  {i+1:2d}. {disease}")

disease_counts = df_clean['DISEASE/TRAIT'].value_counts()
logger.info("\n Most common diseases (by SNPs):")
for i, (disease, count) in enumerate(disease_counts.head(20).items()):
    logger.info(f"  {i+1:2d}. {disease}: {count} SNPs")

# Step 3: Analyze SNPs
logger.info(" Analyzing SNPs")

unique_snps = df_clean['SNPS'].unique()
logger.info(f"Total unique SNPs: {len(unique_snps)}")

# SNPs associated with multiple diseases
snp_to_diseases = defaultdict(list)
for _, row in df_clean.iterrows():
    snp_to_diseases[row['SNPS']].append(row['DISEASE/TRAIT'])

multi_disease_snps = {snp: diseases for snp, diseases in snp_to_diseases.items() if len(set(diseases)) > 1}
logger.info(f"SNPs associated with multiple diseases: {len(multi_disease_snps)}")

logger.info("\n Examples of multi-disease SNPs:")
for i, (snp, diseases) in enumerate(list(multi_disease_snps.items())[:10]):
    unique_diseases = list(set(diseases))
    logger.info(f"  {snp}: {len(unique_diseases)} diseases → {', '.join(unique_diseases[:3])}")

# Step 4: Disease-SNP relationships
logger.info("Disease-SNP relationships")

disease_snp_counts = defaultdict(set)
for _, row in df_clean.iterrows():
    disease_snp_counts[row['DISEASE/TRAIT']].add(row['SNPS'])

disease_pairs = []
diseases_list = list(disease_snp_counts.keys())

for i in range(len(diseases_list)):
    for j in range(i+1, len(diseases_list)):
        disease1 = diseases_list[i]
        disease2 = diseases_list[j]
        snps1 = disease_snp_counts[disease1]
        snps2 = disease_snp_counts[disease2]
        common_snps = snps1.intersection(snps2)
        if common_snps:
            disease_pairs.append({
                'disease1': disease1,
                'disease2': disease2,
                'common_snps': len(common_snps),
                'snps1_only': len(snps1 - snps2),
                'snps2_only': len(snps2 - snps1)
            })

disease_pairs.sort(key=lambda x: x['common_snps'], reverse=True)
logger.info("\n Diseases sharing SNPs (top 10):")
for pair in disease_pairs[:10]:
    logger.info(f"  {pair['disease1'][:30]} & {pair['disease2'][:30]} → {pair['common_snps']} SNPs shared")

# Step 5: Analyze genes

logger.info("Gene analysis (MAPPED_GENE)")
if 'MAPPED_GENE' in df_clean.columns:
    unique_genes = df_clean['MAPPED_GENE'].dropna().unique()
    logger.info(f"Unique genes: {len(unique_genes)}")

    gene_to_diseases = defaultdict(set)
    for _, row in df_clean.iterrows():
        if pd.notna(row['MAPPED_GENE']):
            gene_to_diseases[row['MAPPED_GENE']].add(row['DISEASE/TRAIT'])

    multi_disease_genes = {gene: diseases for gene, diseases in gene_to_diseases.items() if len(diseases) > 1}
    logger.info(f" Genes associated with multiple diseases: {len(multi_disease_genes)}")

    gene_disease_counts = {gene: len(diseases) for gene, diseases in gene_to_diseases.items()}
    top_genes = sorted(gene_disease_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    logger.info("\n Top genes by disease associations:")
    for i, (gene, count) in enumerate(top_genes):
        logger.info(f"  {i+1:2d}. {gene}: associated with {count} diseases")
else:
    logger.info(" MAPPED_GENE column not found")

# Step 6: Summary report
logger.info(" Summary report")

top_diseases = disease_counts.head(10)
logger.info("\n Top diseases to focus on (by SNP count):")
for disease, count in top_diseases.items():
    disease_snps = set(df_clean[df_clean['DISEASE/TRAIT'] == disease]['SNPS'])
    shared_count = sum(len(disease_snps.intersection(other_snps))
                       for other_disease, other_snps in disease_snp_counts.items()
                       if other_disease != disease)
    unique_snps_count = count - shared_count
    logger.info(f"  {disease[:40]:40} → {count:3d} SNPs ({unique_snps_count:3d} unique)")

# Step 7: Create per-disease datasets
logger.info("Creating per-disease datasets")

def create_disease_dataset(disease_name, output_dir='disease_datasets'):
    os.makedirs(output_dir, exist_ok=True)
    disease_data = df_clean[df_clean['DISEASE/TRAIT'] == disease_name].copy()
    if disease_data.empty:
        logger.error(f"Disease '{disease_name}' not found")
        return None

    safe_name = disease_name.replace('/', '_').replace(' ', '_').replace('(', '').replace(')', '')
    disease_file = os.path.join(output_dir, f"{safe_name}_data.csv")
    disease_data.to_csv(disease_file, index=False)

    info_file = os.path.join(output_dir, f"{safe_name}_info.txt")
    with open(info_file, 'w') as f:
        f.write(f"Disease info: {disease_name}\n")
        f.write("="*50 + "\n")
        f.write(f"SNP count: {len(disease_data)}\n")
        f.write(f"Avg risk allele frequency: {disease_data['RISK_ALLELE_FREQUENCY'].mean():.3f}\n")
        f.write(f"Avg effect size: {disease_data['EFFECT_MIDPOINT'].mean():.3f}\n")
        f.write(f"Top SNP (by effect): {disease_data.loc[disease_data['EFFECT_MIDPOINT'].idxmax()]['SNPS']}\n")
        f.write("\nSNP list:\n")
        for snp in disease_data['SNPS'].values:
            f.write(f"  - {snp}\n")

    logger.info(f"Files created for '{disease_name}'")
    return disease_file

top_5_diseases = disease_counts.head(5).index.tolist()
for disease in top_5_diseases:
    create_disease_dataset(disease)


logger.info("GWAS data analysis completed successfully!")

