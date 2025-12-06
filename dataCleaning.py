import pandas as pd
import numpy as np
import logging
import sys


class ColorFormatter(logging.Formatter):
    COLORS = {
        logging.DEBUG: "\033[36m",
        logging.INFO: "\033[32m",
        logging.WARNING: "\033[33m",
        logging.ERROR: "\033[31m",
        logging.CRITICAL: "\033[1;31m"
    }
    RESET = "\033[0m"

    def format(self, record):
        color = self.COLORS.get(record.levelno, self.RESET)
        message = super().format(record)
        return f"{color}{message}{self.RESET}"


handler = logging.StreamHandler(sys.stdout)
formatter = ColorFormatter(
    "%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(handler)
logger.propagate = False

logger.info("Starting GWAS data cleaning...")

try:
    df = pd.read_csv('gwas_clean_data.csv', low_memory=False)
    logger.info(f"Dataset loaded: {df.shape}")
except FileNotFoundError:
    logger.error("File 'gwas_clean_data.csv' not found!")
    sys.exit(1)

if 'DISEASE/TRAIT' in df.columns:
    df = df.rename(columns={'DISEASE/TRAIT': 'DISEASE_TRAIT'})

logger.info("Processing missing values...")

text_cols = ['REGION', 'CHR_ID', 'MAPPED_GENE', 'CONTEXT', 'INTERGENIC']
for col in text_cols:
    if col in df.columns:
        mode_val = df[col].mode()
        if not mode_val.empty:
            fill_value = mode_val.iloc[0]
            missing_count = df[col].isnull().sum()
            if missing_count > 0:
                df[col] = df[col].fillna(fill_value)

if 'DISEASE_TRAIT' in df.columns:
    missing_count = df['DISEASE_TRAIT'].isnull().sum()
    if missing_count > 0:
        df['DISEASE_TRAIT'] = df['DISEASE_TRAIT'].fillna('unspecified_trait')

if 'SNPS' in df.columns:
    missing_mask = df['SNPS'].isnull()
    missing_count = missing_mask.sum()
    if missing_count > 0:
        missing_indices = df[missing_mask].index
        for idx in missing_indices:
            df.at[idx, 'SNPS'] = f"gen_snp_{idx}"

numeric_cols = ['RISK_ALLELE_FREQUENCY', 'P_VALUE', 'P_VALUE_MLOG']
for col in numeric_cols:
    if col in df.columns:
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            if col == 'RISK_ALLELE_FREQUENCY':
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
            elif col == 'P_VALUE':
                df[col] = df[col].fillna(1.0)
            elif col == 'P_VALUE_MLOG':
                df[col] = df[col].fillna(0.0)

if 'CI_95' in df.columns:
    missing_count = df['CI_95'].isnull().sum()
    if missing_count > 0:
        df['CI_95'] = df['CI_95'].fillna('[0.95-1.05]')

if 'EFFECT_SIZE_RANGE' in df.columns:
    missing_count = df['EFFECT_SIZE_RANGE'].isnull().sum()
    if missing_count > 0:
        df['EFFECT_SIZE_RANGE'] = df['EFFECT_SIZE_RANGE'].fillna('[0.99-1.01] unit neutral')

logger.info("Converting data types...")

if 'CHR_ID' in df.columns:
    df['CHR_ID'] = df['CHR_ID'].astype(str)
    df['CHR_ID'] = df['CHR_ID'].apply(lambda x: str(int(float(x))) if x.replace('.', '', 1).isdigit() else x)

if 'P_VALUE' in df.columns:
    df['P_VALUE'] = pd.to_numeric(df['P_VALUE'], errors='coerce')

if 'RISK_ALLELE_FREQUENCY' in df.columns:
    df['RISK_ALLELE_FREQUENCY'] = pd.to_numeric(df['RISK_ALLELE_FREQUENCY'], errors='coerce')

if 'P_VALUE_MLOG' in df.columns:
    df['P_VALUE_MLOG'] = pd.to_numeric(df['P_VALUE_MLOG'], errors='coerce')


def winsorize_series(series, lower_quantile=0.01, upper_quantile=0.99):
    lower_bound = series.quantile(lower_quantile)
    upper_bound = series.quantile(upper_quantile)
    return series.clip(lower_bound, upper_bound)


if 'P_VALUE' in df.columns:
    invalid_mask = (df['P_VALUE'] < 0) | (df['P_VALUE'] > 1)
    invalid_count = invalid_mask.sum()
    if invalid_count > 0:
        df.loc[invalid_mask, 'P_VALUE'] = df.loc[invalid_mask, 'P_VALUE'].clip(0, 1)
    df['P_VALUE'] = winsorize_series(df['P_VALUE'])

if 'RISK_ALLELE_FREQUENCY' in df.columns:
    invalid_mask = (df['RISK_ALLELE_FREQUENCY'] < 0) | (df['RISK_ALLELE_FREQUENCY'] > 1)
    invalid_count = invalid_mask.sum()
    if invalid_count > 0:
        df.loc[invalid_mask, 'RISK_ALLELE_FREQUENCY'] = df.loc[invalid_mask, 'RISK_ALLELE_FREQUENCY'].clip(0, 1)
    df['RISK_ALLELE_FREQUENCY'] = winsorize_series(df['RISK_ALLELE_FREQUENCY'])

if 'DISEASE_TRAIT' in df.columns:
    df['DISEASE_TRAIT'] = df['DISEASE_TRAIT'].astype(str).str.lower().str.strip()
    disease_replacements = {'nan': 'unspecified_trait', 'none': 'unspecified_trait', 'null': 'unspecified_trait'}
    df['DISEASE_TRAIT'] = df['DISEASE_TRAIT'].replace(disease_replacements)

if 'INTERGENIC' in df.columns:
    intergenic_mapping = {
        'y': 'Y', 'yes': 'Y', 'true': 'Y', '1': 'Y',
        'n': 'N', 'no': 'N', 'false': 'N', '0': 'N'
    }
    df['INTERGENIC'] = df['INTERGENIC'].astype(str).str.lower().map(intergenic_mapping).fillna(df['INTERGENIC'])

logger.info("Creating features...")

if 'EFFECT_SIZE_RANGE' in df.columns:
    effect_pattern = r'\[([\d\.]+)\s*-\s*([\d\.]+)\]'
    matches = df['EFFECT_SIZE_RANGE'].str.extract(effect_pattern)
    if not matches.empty:
        df['EFFECT_LOWER'] = pd.to_numeric(matches[0], errors='coerce')
        df['EFFECT_UPPER'] = pd.to_numeric(matches[1], errors='coerce')
        df['EFFECT_MIDPOINT'] = (df['EFFECT_LOWER'] + df['EFFECT_UPPER']) / 2
        df['EFFECT_DIRECTION'] = np.where(
            df['EFFECT_SIZE_RANGE'].str.contains('increase', case=False, na=False), 'increase',
            np.where(df['EFFECT_SIZE_RANGE'].str.contains('decrease', case=False, na=False), 'decrease', 'neutral')
        )

if 'P_VALUE' in df.columns:
    df['IS_SIGNIFICANT_0_05'] = (df['P_VALUE'] < 0.05).astype(int)
    df['IS_SIGNIFICANT_0_01'] = (df['P_VALUE'] < 0.01).astype(int)
    df['IS_SIGNIFICANT_5e_8'] = (df['P_VALUE'] < 5e-8).astype(int)
    bins = [0, 1e-10, 1e-8, 1e-5, 0.001, 0.05, 1]
    labels = ['ultra_sig', 'very_sig', 'high_sig', 'moderate_sig', 'low_sig', 'not_sig']
    df['P_VALUE_CATEGORY'] = pd.cut(df['P_VALUE'], bins=bins, labels=labels, include_lowest=True)

logger.info("Dropping redundant columns...")

columns_to_drop = ['STRONGEST_SNP_RISK_ALLELE', 'SNP_ID', 'EFFECT_SIZE_RANGE']

if 'RISK_ALLELE_FROM_SPLIT' in df.columns:
    columns_to_drop.append('RISK_ALLELE_FROM_SPLIT')

for col in columns_to_drop:
    if col in df.columns:
        df.drop(col, axis=1, inplace=True)
        logger.info(f"Dropped column: {col}")

logger.info("Encoding EFFECT_DIRECTION...")

if 'EFFECT_DIRECTION' in df.columns:
    direction_mapping = {'increase': 1, 'decrease': -1, 'neutral': 0}
    df['EFFECT_DIRECTION_ENCODED'] = df['EFFECT_DIRECTION'].map(direction_mapping).fillna(0).astype(int)

    if 'EFFECT_DIRECTION' in df.columns:
        df.drop('EFFECT_DIRECTION', axis=1, inplace=True)
        logger.info("Encoded and dropped original EFFECT_DIRECTION column")
else:
    logger.warning("EFFECT_DIRECTION column not found for encoding")

logger.info("Checking and fixing remaining null values...")
# Check which columns still have nulls
remaining_nulls = df.isnull().sum()
null_columns = remaining_nulls[remaining_nulls > 0]

if len(null_columns) > 0:
    logger.warning(f"Found {len(null_columns)} columns with null values:")
    for col, count in null_columns.items():
        logger.warning(f"  {col}: {count} null values")

    for col in null_columns.index:
        if df[col].dtype in ['float64', 'int64', 'float32', 'int32']:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            logger.info(f"  {col}: Filled {remaining_nulls[col]} nulls with median: {median_val}")

        elif df[col].dtype == 'object':
            mode_val = df[col].mode()
            if not mode_val.empty:
                fill_val = mode_val.iloc[0]
                df[col] = df[col].fillna(fill_val)
                logger.info(f"  {col}: Filled {remaining_nulls[col]} nulls with mode: '{fill_val}'")
            else:
                df[col] = df[col].fillna('unknown')
                logger.info(f"  {col}: Filled {remaining_nulls[col]} nulls with 'unknown'")

        elif df[col].dtype.name == 'category':
            if len(df[col].cat.categories) > 0:
                fill_val = df[col].cat.categories[0]
                df[col] = df[col].fillna(fill_val)
                logger.info(f"  {col}: Filled {remaining_nulls[col]} nulls with category: '{fill_val}'")
            else:
                df[col] = df[col].fillna('unknown')
                logger.info(f"  {col}: Filled {remaining_nulls[col]} nulls with 'unknown'")

    final_nulls = df.isnull().sum().sum()
    if final_nulls == 0:
        logger.info("All null values have been fixed!")
    else:
        logger.warning(f"Still have {final_nulls} null values remaining")
else:
    logger.info("No null values found!")

output_file = 'gwas_cleaned_final.csv'
df.to_csv(output_file, index=False)

logger.info("Data cleaning completed successfully!")