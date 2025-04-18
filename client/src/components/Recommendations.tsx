import { FC, useEffect, useState } from "react";
import type { PendingCourse } from "../../../backend/models/schemas";
import PeriodCard from "./PeriodCard";
import type { CourseDisplayInfo } from "@/api";

interface RecommendationsProps {
    currentTerm: number;
    recommendations: Record<number, PendingCourse[]>;
}

export const Recommendations: FC<RecommendationsProps> = ({currentTerm, recommendations}) => {
    // Track expanded/collapsed state of each period
    const [expandedPeriods, setExpandedPeriods] = useState<Record<number, boolean>>({
        [currentTerm]: true // Expand current term by default
    });
    
    const [selectedCourseIds] = useState(new Set<number>()); // Since these are recommendations, we start with none selected

    // Toggle period expansion
    const togglePeriod = (period: number) => {
        setExpandedPeriods(prev => ({
            ...prev,
            [period]: !prev[period]
        }));
    };

    // Convert PendingCourse to CourseDisplayInfo
    const convertToCourseDisplayInfo = (course: PendingCourse): CourseDisplayInfo => ({
        id: -1,
        name: course.name,
        professor: "NO professors",
        code: course.code,
        term: course.term,
        isNewCurriculum: course.isNewCurriculum,
        credits: 60,
        CH: 120,
    });

    // Get all periods that have recommendations
    const [periods, setPeriods] = useState<number[]>(Object.keys(recommendations).map(Number));

    useEffect(() => {
        setPeriods(Object.keys(recommendations).map(Number));
    periods.sort((a, b) => a - b);
    console.log(`periods are ${recommendations}`)
    }, [recommendations]);

    return (
        <div className="space-y-3  py-4 rounded-xl">
            <h3> RECOMMENDATIONS </h3>
            {periods.filter(p=>recommendations[p]).map((period) => (
                <PeriodCard
                    period={period}
                    courses={(recommendations[period]).map(convertToCourseDisplayInfo)}
                    selectedCourseIds={selectedCourseIds}
                    isExpanded={expandedPeriods[period] || false}
                    onToggleExpand={togglePeriod}
                    onToggleCourse={() => {}} // No-op since these are just recommendations
                    onAddAllFromPeriod={() => {}} // No-op since these are just recommendations
                />
            ))}
            {periods.length === 0 && (
                <div className="text-muted-foreground text-center py-3">
                    Nenhuma recomendação disponível.
                </div>
            )}
        </div>
    );
}
