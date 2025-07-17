package com.ecommerce.domain.product;

import java.math.BigDecimal;

/**
 * Enumeration representing units of measurement for product dimensions
 * 
 * @author E-Commerce Development Team
 * @version 1.0.0
 */
public enum DimensionUnit {
    /**
     * Millimeters
     */
    MILLIMETER("mm", "Millimeter", BigDecimal.valueOf(0.001)),
    
    /**
     * Centimeters
     */
    CENTIMETER("cm", "Centimeter", BigDecimal.valueOf(0.01)),
    
    /**
     * Meters (base unit)
     */
    METER("m", "Meter", BigDecimal.ONE),
    
    /**
     * Inches
     */
    INCH("in", "Inch", BigDecimal.valueOf(0.0254)),
    
    /**
     * Feet
     */
    FOOT("ft", "Foot", BigDecimal.valueOf(0.3048)),
    
    /**
     * Yards
     */
    YARD("yd", "Yard", BigDecimal.valueOf(0.9144));
    
    private final String symbol;
    private final String displayName;
    private final BigDecimal meterEquivalent; // How many meters equal 1 unit of this
    
    DimensionUnit(String symbol, String displayName, BigDecimal meterEquivalent) {
        this.symbol = symbol;
        this.displayName = displayName;
        this.meterEquivalent = meterEquivalent;
    }
    
    public String getSymbol() {
        return symbol;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public BigDecimal getMeterEquivalent() {
        return meterEquivalent;
    }
    
    /**
     * Get the conversion factor to convert from this unit to the target unit
     * @param targetUnit the unit to convert to
     * @return the conversion factor
     */
    public BigDecimal getConversionFactorTo(DimensionUnit targetUnit) {
        if (this == targetUnit) {
            return BigDecimal.ONE;
        }
        
        // Convert this unit to meters, then to target unit
        // thisValue * thisMeterEquivalent / targetMeterEquivalent = targetValue
        return this.meterEquivalent.divide(targetUnit.meterEquivalent, 10, BigDecimal.ROUND_HALF_UP);
    }
    
    /**
     * Convert a value from this unit to the target unit
     * @param value the value in this unit
     * @param targetUnit the target unit
     * @return the value in the target unit
     */
    public BigDecimal convertTo(BigDecimal value, DimensionUnit targetUnit) {
        return value.multiply(getConversionFactorTo(targetUnit));
    }
    
    /**
     * Check if this is a metric unit
     * @return true if metric, false otherwise
     */
    public boolean isMetric() {
        return this == MILLIMETER || this == CENTIMETER || this == METER;
    }
    
    /**
     * Check if this is an imperial unit
     * @return true if imperial, false otherwise
     */
    public boolean isImperial() {
        return this == INCH || this == FOOT;
    }
} 